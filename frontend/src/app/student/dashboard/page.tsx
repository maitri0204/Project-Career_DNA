"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { serviceAPI } from "@/lib/api";
import { ServiceItem, User } from "@/types";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [enrolledCodes, setEnrolledCodes] = useState<Set<string>>(new Set());
  const [serviceLocked, setServiceLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        /* noop */
      }
    }

    const loadAll = async () => {
      try {
        const [servicesRes, enrollmentsRes] = await Promise.all([
          serviceAPI.getAll(),
          serviceAPI
            .getMyEnrollments()
            .catch(() => ({ data: { enrollments: [] } })),
        ]);

        setServices(servicesRes.data.services || []);
        const codes = new Set<string>(
          (enrollmentsRes.data.enrollments || []).map(
            (e: { serviceCode: string }) => e.serviceCode
          )
        );
        setEnrolledCodes(codes);
        setServiceLocked(enrollmentsRes.data.serviceLocked === true);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleEnroll = async (service: ServiceItem) => {
    setEnrollingId(service._id);
    try {
      await serviceAPI.enroll(service._id);
      setEnrolledCodes((prev) => new Set([...prev, service.code]));
      setServiceLocked(true);
      toast.success(`Successfully registered for ${service.name}!`);

      // Update user in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          u.enrolledServices = u.enrolledServices || [];
          u.enrolledServices.push({
            serviceCode: service.code,
            service: service._id,
            enrolledAt: new Date().toISOString(),
          });
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
        } catch {
          /* noop */
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrollingId(null);
    }
  };

  const handleViewDetails = (serviceCode: string) => {
    router.push(`/student/test?service=${serviceCode}`);
  };

  // Custom sort: GRADE_8_9 first, then GRADE_10, then GRADE_11_12
  const SERVICE_ORDER: Record<string, number> = { GRADE_8_9: 0, GRADE_10: 1, GRADE_11_12: 2 };
  const sortByGrade = (a: ServiceItem, b: ServiceItem) =>
    (SERVICE_ORDER[a.code] ?? 99) - (SERVICE_ORDER[b.code] ?? 99);

  const enrolledServices = services.filter((s) => enrolledCodes.has(s.code)).sort(sortByGrade);
  const availableServices = services.filter((s) => !enrolledCodes.has(s.code)).sort(sortByGrade);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* ═══ MY SERVICES ═══ */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Services
          </h1>
          <p className="text-gray-600 text-base mt-2">
            Manage your registered services and track your progress.
          </p>
        </div>

        {enrolledServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                isRegistered={true}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Services Yet
            </h3>
            <p className="text-gray-600">
              You haven&apos;t registered for any services yet. Browse below to
              get started.
            </p>
          </div>
        )}

        {/* ═══ OTHER SERVICES ═══ */}
        {availableServices.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Services
              </h2>
              <p className="text-gray-600 text-base mt-2">
                Explore and register for additional services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  isRegistered={false}
                  onRegister={handleEnroll}
                  loading={enrollingId === service._id}
                  blocked={serviceLocked}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ServiceCard Component (matching temp-core style) ─── */

function ServiceCard({
  service,
  isRegistered = false,
  onRegister,
  onViewDetails,
  loading = false,
  blocked = false,
}: {
  service: ServiceItem;
  isRegistered?: boolean;
  onRegister?: (service: ServiceItem) => void;
  onViewDetails?: (serviceCode: string) => void;
  loading?: boolean;
  blocked?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Card Header with Gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

      <div className="p-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Status Badge */}
        {isRegistered && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Registered
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {isRegistered ? (
            <button
              onClick={() => onViewDetails?.(service.code)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              View Details
            </button>
          ) : blocked ? (
            <div className="flex-1 text-center">
              <div className="px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed border border-gray-200">
                🔒 Locked
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Contact admin to unlock</p>
            </div>
          ) : (
            <button
              onClick={() => onRegister?.(service)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
