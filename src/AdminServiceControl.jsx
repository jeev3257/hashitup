import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  Clock,
  Server,
} from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export function AdminServiceControl({ onNavigate }) {
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch service status from Firebase
  const fetchServiceStatus = async () => {
    try {
      setLoadingStatus(true);

      // Get service status
      const serviceRef = doc(db, "system_services", "compliance-backend-001");
      const serviceDoc = await getDoc(serviceRef);

      if (serviceDoc.exists()) {
        const data = serviceDoc.data();
        setServiceStatus(data);
        setLastUpdate(new Date());
      } else {
        setServiceStatus(null);
      }

      // Get companies count
      const companiesRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesRef);
      setCompaniesCount(companiesSnapshot.size);
    } catch (error) {
      console.error("Error fetching service status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchServiceStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "RUNNING":
        return "text-green-400";
      case "STOPPED":
        return "text-red-400";
      case "ERROR":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RUNNING":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "STOPPED":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "ERROR":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                System Administration
              </h1>
              <p className="text-gray-400">
                Backend Compliance Service Management
              </p>
            </div>
            <Button
              onClick={() => onNavigate("admin")}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              ← Back to Admin
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Status */}
          <Card className="glass-card border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Service Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingStatus ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse bg-gray-600 h-4 w-20 rounded"></div>
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : serviceStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(serviceStatus.status)}
                      <span
                        className={`font-medium ${getStatusColor(
                          serviceStatus.status
                        )}`}
                      >
                        {serviceStatus.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Name</span>
                    <span className="text-sm text-gray-400">
                      {serviceStatus.serviceName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Version</span>
                    <Badge variant="outline" className="text-xs">
                      {serviceStatus.version}
                    </Badge>
                  </div>

                  {serviceStatus.startTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Started</span>
                      <span className="text-xs text-gray-400">
                        {new Date(
                          serviceStatus.startTime.seconds * 1000
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {serviceStatus.lastHealthCheck && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Last Health Check</span>
                      <span className="text-xs text-gray-400">
                        {new Date(
                          serviceStatus.lastHealthCheck.seconds * 1000
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-medium">
                    Service Not Running
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    No service status found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monitoring Statistics */}
          <Card className="glass-card border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Monitoring Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Companies Monitored</span>
                <span className="text-2xl font-bold text-blue-400">
                  {serviceStatus?.companiesMonitored || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Companies</span>
                <span className="text-lg text-gray-400">{companiesCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Check Interval</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">5 minutes</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Service Type</span>
                <Badge className="bg-blue-600 text-white">Backend</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Service Controls */}
          <Card className="glass-card border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Service Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This compliance service runs as a backend process. Companies
                  cannot control this service. Only system administrators can
                  manage this service.
                </p>
              </div>

              <Button
                onClick={fetchServiceStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                🔄 Refresh Status
              </Button>

              {serviceStatus?.status === "RUNNING" ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-400 font-medium">
                    Service Running Normally
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Automated compliance monitoring is active
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-400 font-medium">
                    Service Not Running
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start the backend service manually
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Description */}
        <Card className="glass-card border-white/10 rounded-xl mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              About Backend Compliance Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>
                The Backend Compliance Service is an automated system that
                monitors all approved companies for emission compliance every 5
                minutes by clock time (e.g., 3:05, 3:10, 3:15).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Automatic emission cap monitoring</li>
                    <li>• Smart contract execution</li>
                    <li>• Credit minting for compliance</li>
                    <li>• Credit deduction for violations</li>
                    <li>• Company flagging system</li>
                    <li>• 24/7 operation</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Security:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Backend-only operation</li>
                    <li>• Company cannot control</li>
                    <li>• Admin-only management</li>
                    <li>• Blockchain secured</li>
                    <li>• Firebase logged</li>
                    <li>• Health monitoring</li>
                  </ul>
                </div>
              </div>

              {lastUpdate && (
                <p className="text-xs text-gray-400 border-t border-white/10 pt-4">
                  Last updated: {lastUpdate.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
