import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  logoutCompany,
  getCompanyEmissions,
  getRealTimeBalance,
  getRealTimeComplianceData,
  getEmissionTransactionHistory,
} from "./firebase";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  LineChart as LineChartIcon,
  ShoppingCart,
  TrendingUp,
  Wallet,
  FileText,
  Activity,
  AlertTriangle,
  Shield,
  Award,
  RefreshCw,
  Users,
  Globe,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function NewDashboard({ company, onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [realTimeBalance, setRealTimeBalance] = useState(0);
  const [emissions, setEmissions] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sample data for charts
  const emissionData = [
    { month: "Jan", current: 850, target: 1000, prediction: 900 },
    { month: "Feb", current: 920, target: 1000, prediction: 950 },
    { month: "Mar", current: 1100, target: 1000, prediction: 1050 },
    { month: "Apr", current: 980, target: 1000, prediction: 1000 },
    { month: "May", current: 1200, target: 1000, prediction: 1150 },
    { month: "Jun", current: 1050, target: 1000, prediction: 1080 },
  ];

  const complianceOverview = [
    { name: "Compliant", value: 75, color: "#10B981" },
    { name: "At Risk", value: 20, color: "#F59E0B" },
    { name: "Non-Compliant", value: 5, color: "#EF4444" },
  ];

  const sidebarItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "emissions", icon: BarChart3, label: "Emissions" },
    { id: "compliance", icon: Shield, label: "Compliance" },
    { id: "analytics", icon: LineChartIcon, label: "Analytics" },
    { id: "transactions", icon: Activity, label: "Transactions" },
    { id: "marketplace", icon: ShoppingCart, label: "Marketplace" },
  ];

  useEffect(() => {
    if (company) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [company]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real-time balance
      if (company?.id) {
        const balanceResult = await getRealTimeBalance(company.id);
        // Handle the response object from getRealTimeBalance
        if (balanceResult?.success && typeof balanceResult.balance === 'number') {
          setRealTimeBalance(balanceResult.balance);
        } else {
          console.warn('Failed to get real-time balance:', balanceResult?.error);
          setRealTimeBalance(0);
        }
      }

      // Load emissions data
      const emissionsData = await getCompanyEmissions(company?.id);
      setEmissions(Array.isArray(emissionsData) ? emissionsData : []);

      // Load compliance data
      const compliance = await getRealTimeComplianceData();
      setComplianceData(Array.isArray(compliance) ? compliance : []);

      // Load transactions
      const txHistory = await getEmissionTransactionHistory();
      setTransactions(Array.isArray(txHistory) ? txHistory : []);

      setLastSyncTime(new Date().toLocaleString());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadDashboardData();
    setIsSyncing(false);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Carbon Credits</CardTitle>
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{typeof realTimeBalance === 'number' ? realTimeBalance : 0}</span>
              <span className="text-sm text-gray-400">CCT</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Monthly Emissions</CardTitle>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">1,050</span>
              <span className="text-sm text-gray-400">tons CO₂</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Compliance Status</CardTitle>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">95%</span>
              <span className="text-sm text-gray-400">compliant</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Transactions</CardTitle>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">{(transactions || []).length}</span>
              <span className="text-sm text-gray-400">this month</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Trend */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Emissions Trend</CardTitle>
            <CardDescription className="text-gray-400">
              Monthly emissions vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Overview */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Compliance Overview</CardTitle>
            <CardDescription className="text-gray-400">
              Current compliance distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceOverview}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {complianceOverview.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest transactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(!transactions || transactions.length === 0) ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No recent transactions</p>
                <p className="text-gray-500 text-sm">Transaction history will appear here</p>
              </div>
            ) : (
              (transactions || []).slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {transaction.companyName?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {transaction.reason || 'Credit Transaction'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transaction.timestamp?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={transaction.balanceChange >= 0 ? "default" : "destructive"}
                    className={transaction.balanceChange >= 0 ? "bg-green-600" : "bg-red-600"}
                  >
                    {transaction.balanceChange >= 0 ? '+' : ''}{transaction.balanceChange || 0} CCT
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmissionsTab = () => (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Emission Analytics</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed emission tracking and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 glass-sidebar flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">E</span>
              </div>
              <span className="text-2xl font-semibold text-white">EcoChain</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-600 text-white">
                  {company?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{company?.name}</p>
                <p className="text-xs text-gray-400">{company?.email}</p>
              </div>
            </div>
            <Button
              onClick={() => logoutCompany()}
              className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-400">
                  Welcome back, {company?.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Last updated: {lastSyncTime || 'Loading...'}
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isSyncing}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Refresh
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading dashboard...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && renderOverviewTab()}
                {activeTab === "emissions" && renderEmissionsTab()}
                {activeTab === "compliance" && (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Compliance module coming soon</p>
                  </div>
                )}
                {activeTab === "analytics" && (
                  <div className="text-center py-12">
                    <LineChartIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Analytics module coming soon</p>
                  </div>
                )}
                {activeTab === "transactions" && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Transactions module coming soon</p>
                  </div>
                )}
                {activeTab === "marketplace" && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Marketplace module coming soon</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default NewDashboard;