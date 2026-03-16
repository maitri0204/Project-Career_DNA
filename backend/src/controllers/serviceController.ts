import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Service from "../models/Service";
import User from "../models/User";

// Get all active services
export const getAllServices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const services = await Service.find({ isActive: true }).sort({ code: 1 });
    res.json({ services });
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({ message: "Failed to get services" });
  }
};

// Enroll current student in a service
export const enrollInService = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledServices.some(
      (e) => e.serviceCode === service.code
    );
    if (alreadyEnrolled) {
      res.status(400).json({ message: "Already enrolled in this service" });
      return;
    }

    user.enrolledServices.push({
      service: service._id as any,
      serviceCode: service.code,
      enrolledAt: new Date(),
    });
    await user.save();

    res.json({
      message: "Enrolled successfully",
      enrollment: {
        serviceId: service._id,
        serviceCode: service.code,
        serviceName: service.name,
      },
    });
  } catch (error) {
    console.error("Error enrolling in service:", error);
    res.status(500).json({ message: "Failed to enroll" });
  }
};

// Get current user's enrollments
export const getMyEnrollments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).populate("enrolledServices.service");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ enrollments: user.enrolledServices });
  } catch (error) {
    console.error("Error getting enrollments:", error);
    res.status(500).json({ message: "Failed to get enrollments" });
  }
};
