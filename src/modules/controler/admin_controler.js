import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { appointmentModel } from "../models/Appointment_model.js";
import { doctorDetailsModel } from "../models/Doctor_model.js";
import { userModel } from "../models/user_model.js";


export const getAllUsers = ErrorHandler(async (req, res) => {
  const users = await userModel.find({}, "name email role gender");
  
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users }
  });
});

export const promoteToDoctor = ErrorHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new SendError(400, "يرجى إدخال إيميل المستخدم");

  const user = await userModel.findOne({ email });
  if (!user) throw new SendError(404, "هذا الإيميل غير مسجل في السيستم");


  if (user.role === "doctor") throw new SendError(400, "هذا المستخدم دكتور بالفعل");


  user.role = "doctor";
  await user.save();


  const newDoctorProfile = await doctorDetailsModel.create({
    userId: user._id
  });

  res.status(200).json({
    status: "success",
    message: "تمت ترقية المستخدم إلى طبيب بنجاح، وتأسيس بروفايل مهني فارغ له",
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }
  });
});

export const getAdminDashboard = ErrorHandler(async (req, res) => {
  
  const appointmentStats = await appointmentModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $lookup: {
        from: "doctordetails", 
        localField: "doctorId",
        foreignField: "userId",
        as: "doctorInfo"
      }
    },
    { $unwind: "$doctorInfo" },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$doctorInfo.consultationFee" }, 
        paidAppointments: { $sum: 1 } 
      }
    }
  ]);

  const totalAppointmentsCount = await appointmentModel.countDocuments();
  const totalPatients = await userModel.countDocuments({ role: "patient" });
  const stats = appointmentStats[0] || { totalRevenue: 0, paidAppointments: 0 };

  res.status(200).json({
    status: "success",
    data: {
      totalRevenue: stats.totalRevenue,
      paidAppointmentsCount: stats.paidAppointments,
      totalAppointmentsCount,
      totalPatientsCount: totalPatients
    }
  });
});