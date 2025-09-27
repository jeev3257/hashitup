import React, { useState, useEffect, useRef } from "react";
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
  addSampleEmissionData,
  getCompanyPredictions,
  addSamplePredictionData,
  processEmissionCompliance,
  checkBuyCreditTimer,
  getComplianceHistory,
  getSmartContractHistory,
  getSmartContractHistoryFromLogs,
  getRealTimeBalance,
  updateCompanyCreditBalance,
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
} from "recharts";

// Next Compliance Countdown Component
function NextComplianceCountdown() {
  const [timeUntilNext, setTimeUntilNext] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Find next 5-minute mark
      const nextMark = Math.ceil(minutes / 5) * 5;
      const targetMinutes = nextMark === 60 ? 0 : nextMark;
      const targetHour = nextMark === 60 ? now.getHours() + 1 : now.getHours();

      const target = new Date();
      target.setHours(targetHour);
      target.setMinutes(targetMinutes);
      target.setSeconds(0);
      target.setMilliseconds(0);

      if (target <= now) {
        target.setMinutes(target.getMinutes() + 5);
      }

      const diff = target.getTime() - now.getTime();
      const minutesLeft = Math.floor(diff / 60000);
      const secondsLeft = Math.floor((diff % 60000) / 1000);

      setTimeUntilNext(
        `${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs text-blue-400 font-mono">Next: {timeUntilNext}</div>
  );
}

export function Dashboard({ onNavigate, companyData }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [emissionData, setEmissionData] = useState([]);
  const [loadingEmissions, setLoadingEmissions] = useState(true);
  const [emissionError, setEmissionError] = useState(null);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [emissionChange, setEmissionChange] = useState({
    value: 0,
    isPositive: true,
  });
  const [predictionData, setPredictionData] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [predictionError, setPredictionError] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [buyTimer, setBuyTimer] = useState(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [complianceHistory, setComplianceHistory] = useState(null);
  const [smartContractHistory, setSmartContractHistory] = useState([]);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [realTimeBalance, setRealTimeBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [balanceUpdated, setBalanceUpdated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [realTimeComplianceData, setRealTimeComplianceData] = useState([]);
  const [emissionTransactions, setEmissionTransactions] = useState([]);
  const [loadingRealTimeData, setLoadingRealTimeData] = useState(true);
  const dropdownRef = useRef(null);

  const handleManualRefresh = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      setLoadingRealTimeData(true);
      console.log("🔄 Manually refreshing data...");

      const [
        complianceResult,
        transactionResult,
        balanceResult,
        historyResult,
        complianceHistoryResult
      ] = await Promise.all([
        getRealTimeComplianceData(),
        getEmissionTransactionHistory(),
        companyData?.uid ? getRealTimeBalance(companyData.uid) : Promise.resolve({ success: false }),
        companyData?.uid ? getSmartContractHistory(companyData.uid, 20) : Promise.resolve({ success: false }),
        companyData?.uid ? getComplianceHistory(companyData.uid) : Promise.resolve({ success: false }),
      ]);

      if (complianceResult.success) {
        setRealTimeComplianceData(complianceResult.data);
      }
      if (transactionResult.success) {
        setEmissionTransactions(transactionResult.transactions);
      }
      if (balanceResult.success) {
        setCreditBalance(balanceResult.balance);
      }
      if (historyResult.success) {
        setSmartContractHistory(historyResult.transactions);
      }
      if (complianceHistoryResult.success) {
        setComplianceHistory(complianceHistoryResult.history);
      }

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setIsSyncing(false);
      setLoadingRealTimeData(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutCompany();
      if (result.success) {
        onNavigate("landing");
      } else {
        console.error("Logout failed:", result.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch emission data when component mounts
  useEffect(() => {
    const fetchEmissionData = async () => {
      if (!companyData?.uid) {
        console.log("⚠️ No company UID available for fetching emissions");
        setLoadingEmissions(false);
        return;
      }

      try {
        setLoadingEmissions(true);
        setEmissionError(null);

        console.log("📊 Fetching emission data for company:", companyData.uid);
        const result = await getCompanyEmissions(companyData.uid, 24); // Get last 24 records

        if (result.success && result.emissions.length > 0) {
          // Format data for the chart
          const chartData = result.emissions.map((emission, index) => ({
            time: emission.date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            value: emission.emissionValue,
            date: emission.date,
            id: emission.id,
          }));

          setEmissionData(chartData);
          calculateEmissionMetrics(result.emissions);
          console.log("✅ Emission data loaded:", chartData.length, "records");
        } else if (result.success && result.emissions.length === 0) {
          console.log("📋 No emission data found, offering to add sample data");
          setEmissionError(
            "No emission data available. Would you like to add sample data?"
          );
          calculateEmissionMetrics([]); // This will set metrics to 0
        } else {
          console.error("❌ Failed to fetch emission data:", result.error);
          setEmissionError("Failed to load emission data: " + result.error);
        }
      } catch (error) {
        console.error("❌ Error fetching emission data:", error);
        setEmissionError("Error loading emission data: " + error.message);
      } finally {
        setLoadingEmissions(false);
      }
    };

    // Fetch prediction data
    const fetchPredictionData = async () => {
      if (!companyData?.uid) {
        console.log("⚠️ No company UID available for fetching predictions");
        setLoadingPredictions(false);
        return;
      }

      try {
        setLoadingPredictions(true);
        setPredictionError(null);

        console.log(
          "🔮 Fetching prediction data for company:",
          companyData.uid
        );
        const result = await getCompanyPredictions(companyData.uid, 24);

        if (result.success && result.predictions.length > 0) {
          const chartData = result.predictions.map((prediction) => ({
            time: prediction.date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            value: prediction.predictedValue,
            date: prediction.date,
            id: prediction.id,
          }));

          setPredictionData(chartData);
          console.log(
            "✅ Prediction data loaded:",
            chartData.length,
            "records"
          );
        } else if (result.success && result.predictions.length === 0) {
          console.log("📋 No prediction data found");
          setPredictionError(
            "No prediction data available. Would you like to add sample predictions?"
          );
        } else {
          console.error("❌ Failed to fetch prediction data:", result.error);
          setPredictionError("Failed to load prediction data: " + result.error);
        }
      } catch (error) {
        console.error("❌ Error fetching prediction data:", error);
        setPredictionError("Error loading prediction data: " + error.message);
      } finally {
        setLoadingPredictions(false);
      }
    };

    // Fetch compliance history data
    const fetchComplianceData = async () => {
      if (!companyData?.uid) {
        console.log("⚠️ No company UID available for fetching compliance data");
        setLoadingCompliance(false);
        return;
      }

      try {
        setLoadingCompliance(true);
        console.log(
          "🔍 Fetching compliance history for company:",
          companyData.uid
        );
        console.log("📋 Company data:", companyData);

        const [historyResult, contractResult] = await Promise.all([
          getComplianceHistory(companyData.uid),
          getSmartContractHistory(companyData.uid, 20), // Increased limit to get more records
        ]);

        if (historyResult.success) {
          setComplianceHistory(historyResult.history);
          console.log("✅ Compliance history loaded:", historyResult.history);
        } else {
          console.error(
            "❌ Failed to fetch compliance history:",
            historyResult.error
          );
        }

        if (contractResult.success) {
          setSmartContractHistory(contractResult.transactions);
          console.log(
            "✅ Smart contract history loaded:",
            contractResult.transactions.length,
            "transactions"
          );
        } else {
          console.error(
            "❌ Failed to fetch smart contract history:",
            contractResult.error
          );

          // Try loading test company data as fallback
          console.log("🔄 Trying test company data...");
          const testResult = await getSmartContractHistory("complete-test-001");
          if (testResult.success && testResult.transactions.length > 0) {
            setSmartContractHistory(testResult.transactions);
            console.log(
              "✅ Test company smart contract history loaded:",
              testResult.transactions
            );
          }
        }
      } catch (error) {
        console.error("❌ Error fetching compliance data:", error);
      } finally {
        setLoadingCompliance(false);
      }
    };

    // Fetch real-time balance from blockchain
    const fetchRealTimeBalance = async () => {
      if (!companyData?.uid) {
        console.log("⚠️ No company UID available for fetching balance");
        setLoadingBalance(false);
        return;
      }

      try {
        setLoadingBalance(true);
        setBalanceError(null);
        console.log(
          "💰 Fetching real-time balance for company:",
          companyData.uid
        );

        const balanceResult = await getRealTimeBalance(companyData.uid);

        if (balanceResult.success) {
          setRealTimeBalance(balanceResult.balance);
          console.log(
            "✅ Real-time balance loaded:",
            balanceResult.balance,
            "CCT"
          );
        } else {
          console.error(
            "❌ Failed to fetch real-time balance:",
            balanceResult.error
          );
          setBalanceError(balanceResult.error);
          // Fallback to Firebase data if blockchain fails
          setRealTimeBalance(companyData?.creditBalance || 0);
        }
      } catch (error) {
        console.error("❌ Error fetching real-time balance:", error);
        setBalanceError(error.message);
        // Fallback to Firebase data if blockchain fails
        setRealTimeBalance(companyData?.creditBalance || 0);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchEmissionData();
    fetchPredictionData();
    fetchComplianceData();
    fetchRealTimeBalance();
  }, [companyData?.uid, companyData?.creditBalance]);

  // Quick balance refresh without loading state (for real-time updates)
  const quickBalanceRefresh = async () => {
    if (!companyData?.uid) return;

    try {
      const balanceResult = await getRealTimeBalance(companyData.uid);
      if (balanceResult.success) {
        const oldBalance = realTimeBalance;
        setRealTimeBalance(balanceResult.balance);
        console.log("⚡ Quick balance refresh:", balanceResult.balance, "CCT");

        // Show visual indicator if balance changed
        if (oldBalance !== balanceResult.balance) {
          setBalanceUpdated(true);
          setTimeout(() => setBalanceUpdated(false), 2000);
        }
      }
    } catch (error) {
      console.error("❌ Quick balance refresh failed:", error);
    }
  };

  // Real-time compliance monitoring - refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("🔄 Refreshing real-time compliance data...");
      try {
        // Refresh real-time compliance data and emission transactions
        const [complianceResult, transactionResult, contractResult, balanceResult] = await Promise.all([
          getRealTimeComplianceData(),
          getEmissionTransactionHistory(),
          companyData?.uid ? getSmartContractHistory(companyData.uid, 20) : Promise.resolve({ success: false }),
          companyData?.uid ? getRealTimeBalance(companyData.uid) : Promise.resolve({ success: false }),
        ]);

        if (complianceResult.success) {
          setRealTimeComplianceData(complianceResult.data);
        }
        if (transactionResult.success) {
          setEmissionTransactions(transactionResult.transactions);
        }
        if (contractResult.success) {
          setSmartContractHistory(contractResult.transactions);

          // If there are new transactions, trigger an additional balance refresh
          if (contractResult.transactions.length > 0) {
            console.log("🔄 New transactions detected, refreshing balance...");
            setTimeout(() => quickBalanceRefresh(), 2000);
          }
        }

        if (balanceResult.success) {
          setRealTimeBalance(balanceResult.balance);
          console.log("🔄 Balance refreshed:", balanceResult.balance, "CCT");
        }
      } catch (error) {
        console.error("❌ Error refreshing compliance data:", error);
      }
    }, 60000); // Refresh every 60 seconds instead of 30

    return () => clearInterval(interval);
  }, [companyData?.uid]);

  // Initial load of real-time compliance data
  useEffect(() => {
    const loadInitialRealTimeData = async () => {
      try {
        setLoadingRealTimeData(true);
        console.log("🔄 Loading initial real-time compliance data...");
        
        const [complianceResult, transactionResult] = await Promise.all([
          getRealTimeComplianceData(),
          getEmissionTransactionHistory(),
        ]);

        if (complianceResult.success) {
          setRealTimeComplianceData(complianceResult.data);
        }
        if (transactionResult.success) {
          setEmissionTransactions(transactionResult.transactions);
        }
      } catch (error) {
        console.error("❌ Error loading initial real-time data:", error);
      } finally {
        setLoadingRealTimeData(false);
      }
    };

    loadInitialRealTimeData();
  }, []);

  // Function to add sample data
  const handleAddSampleData = async () => {
    if (!companyData?.uid) return;

    try {
      setLoadingEmissions(true);
      const result = await addSampleEmissionData(companyData.uid, 24);

      if (result.success) {
        // Refetch the data
        const emissionResult = await getCompanyEmissions(companyData.uid, 24);
        if (emissionResult.success) {
          const chartData = emissionResult.emissions.map((emission) => ({
            time: emission.date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            value: emission.emissionValue,
            date: emission.date,
            id: emission.id,
          }));

          setEmissionData(chartData);
          calculateEmissionMetrics(emissionResult.emissions);
          setEmissionError(null);
        }
      }
    } catch (error) {
      console.error("Error adding sample data:", error);
      setEmissionError("Failed to add sample data: " + error.message);
    } finally {
      setLoadingEmissions(false);
    }
  };

  // Function to add sample prediction data
  const handleAddSamplePredictions = async () => {
    if (!companyData?.uid) return;

    try {
      setLoadingPredictions(true);
      const result = await addSamplePredictionData(companyData.uid, 24);

      if (result.success) {
        // Refetch the prediction data
        const predictionResult = await getCompanyPredictions(
          companyData.uid,
          24
        );
        if (predictionResult.success) {
          const chartData = predictionResult.predictions.map((prediction) => ({
            time: prediction.date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            value: prediction.predictedValue,
            date: prediction.date,
            id: prediction.id,
          }));

          setPredictionData(chartData);
          setPredictionError(null);
        }
      }
    } catch (error) {
      console.error("Error adding sample predictions:", error);
      setPredictionError("Failed to add sample predictions: " + error.message);
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Calculate emission metrics from real data
  const calculateEmissionMetrics = (emissions) => {
    console.log(
      "🧮 Calculating metrics for emissions:",
      emissions?.length || 0,
      "records"
    );

    if (!emissions || emissions.length === 0) {
      console.log("📊 No emissions data - setting metrics to 0");
      setTotalEmissions(0);
      setEmissionChange({ value: 0, isPositive: true });
      return;
    }

    // Calculate total emissions (sum of all values)
    const total = emissions.reduce(
      (sum, emission) => sum + emission.emissionValue,
      0
    );
    console.log("📈 Total emissions calculated:", total);
    setTotalEmissions(total);

    // Calculate percentage change (compare last 5 minutes with previous 5 minutes)
    if (emissions.length >= 10) {
      const recentEmissions = emissions.slice(0, 5); // Last 5 records
      const previousEmissions = emissions.slice(5, 10); // Previous 5 records

      const recentTotal = recentEmissions.reduce(
        (sum, e) => sum + e.emissionValue,
        0
      );
      const previousTotal = previousEmissions.reduce(
        (sum, e) => sum + e.emissionValue,
        0
      );

      if (previousTotal > 0) {
        const changePercent =
          ((recentTotal - previousTotal) / previousTotal) * 100;
        console.log(
          "📊 Change calculated:",
          changePercent.toFixed(1) + "%",
          "Recent:",
          recentTotal,
          "Previous:",
          previousTotal
        );
        setEmissionChange({
          value: Math.abs(changePercent),
          isPositive: changePercent >= 0,
        });
      } else {
        setEmissionChange({ value: 0, isPositive: true });
      }
    } else {
      // Not enough data for comparison - but show some data if available
      console.log("📊 Not enough data for comparison, showing 0% change");
      setEmissionChange({ value: 0, isPositive: true });
    }
  };

  // Calculate prediction metrics
  const calculatePredictionMetrics = () => {
    if (!predictionData || predictionData.length === 0) {
      return {
        totalPredicted: 0,
        avgPredicted: 0,
        trend: "stable",
        nextMinutePrediction: 0,
        latestPredictionTime: null,
      };
    }

    const total = predictionData.reduce((sum, pred) => sum + pred.value, 0);
    const avg = total / predictionData.length;

    // Get the latest (most recent) prediction - first item since data is sorted by date desc
    const latestPrediction = predictionData[0];
    const nextMinutePrediction = latestPrediction ? latestPrediction.value : 0;
    const latestPredictionTime = latestPrediction
      ? latestPrediction.time
      : null;

    // Calculate trend by comparing latest prediction with previous ones
    let trend = "stable";
    if (predictionData.length >= 3) {
      const recent = predictionData.slice(0, 3);
      const recentAvg =
        recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
      const older = predictionData.slice(3, 6);

      if (older.length > 0) {
        const olderAvg =
          older.reduce((sum, p) => sum + p.value, 0) / older.length;

        if (recentAvg > olderAvg * 1.05) trend = "increasing";
        else if (recentAvg < olderAvg * 0.95) trend = "decreasing";
      }
    }

    return {
      totalPredicted: total,
      avgPredicted: avg,
      trend,
      nextMinutePrediction,
      latestPredictionTime,
    };
  };

  const predictionMetrics = calculatePredictionMetrics();

  // Compliance monitoring functions
  const handleRunComplianceCheck = async () => {
    if (!companyData?.uid) return;

    try {
      console.log("🔍 Running compliance check...");
      const result = await processEmissionCompliance(companyData.uid);

      if (result.success) {
        setComplianceStatus(result);

        // If credits were minted or deducted, refresh balance immediately
        if (
          result.action === "CREDITS_MINTED" ||
          result.action === "CREDITS_DEDUCTED"
        ) {
          console.log("💰 Refreshing balance after compliance action...");
          setTimeout(async () => {
            const balanceResult = await getRealTimeBalance(companyData.uid);
            if (balanceResult.success) {
              setRealTimeBalance(balanceResult.balance);
              console.log(
                "✅ Balance refreshed:",
                balanceResult.balance,
                "CCT"
              );
            }
          }, 1000); // Small delay to ensure blockchain transaction is confirmed
        }

        // If timer started, begin countdown
        if (result.action === "BUY_TIMER_STARTED") {
          setBuyTimer(result.timer);
          startTimerCountdown(result.timer);
        }

        // Refresh smart contract activity to show new transactions
        loadComplianceData();
      }
    } catch (error) {
      console.error("Error running compliance check:", error);
    }
  };

  const startTimerCountdown = (timer) => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(timer.expiresAt).getTime();
      const timeRemaining = expiry - now;

      if (timeRemaining <= 0) {
        // Timer expired - flag company
        handleTimerExpired();
        return;
      }

      setBuyTimer((prev) => ({ ...prev, timeRemaining }));
      setTimeout(updateTimer, 1000);
    };
    updateTimer();
  };

  const handleTimerExpired = async () => {
    if (!companyData?.uid) return;

    try {
      // Flag company for non-compliance
      const { flagCompanyForNonCompliance } = await import("./firebase.js");
      await flagCompanyForNonCompliance(
        companyData.uid,
        "Failed to purchase required carbon credits within time limit",
        complianceStatus?.creditsRequired || 0
      );

      setComplianceStatus((prev) => ({ ...prev, action: "COMPANY_FLAGGED" }));
      setBuyTimer(null);
    } catch (error) {
      console.error("Error flagging company:", error);
    }
  };

  const handlePurchaseCredits = async (amount) => {
    if (!companyData?.walletAddress) return;

    try {
      const { blockchainService } = await import("./blockchain.js");
      const ethAmount = (amount * 0.001).toFixed(3); // 1000 credits = 1 ETH

      const result = await blockchainService.purchaseCredits(
        companyData.walletAddress,
        amount,
        ethAmount
      );

      if (result.success) {
        // Clear compliance status and timer
        setComplianceStatus(null);
        setBuyTimer(null);

        // Show success message
        console.log("✅ Credits purchased successfully!");
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
    }
  };

  // Combine emission and prediction data for chart display
  const getCombinedChartData = () => {
    // Create a map of time slots with both real and predicted values
    const timeMap = new Map();

    // Add emission data
    emissionData.forEach((emission) => {
      timeMap.set(emission.time, {
        time: emission.time,
        realValue: emission.value,
        predictedValue: null,
        date: emission.date,
      });
    });

    // Add prediction data
    predictionData.forEach((prediction) => {
      if (timeMap.has(prediction.time)) {
        timeMap.get(prediction.time).predictedValue = prediction.value;
      } else {
        timeMap.set(prediction.time, {
          time: prediction.time,
          realValue: null,
          predictedValue: prediction.value,
          date: prediction.date,
        });
      }
    });

    // Convert to array and sort by time
    return Array.from(timeMap.values()).sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      return a.time.localeCompare(b.time);
    });
  };

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Get the original data point
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">Time: {label}</p>
          {data.realValue && (
            <p className="text-emerald-400 font-semibold mb-1">
              Real: {data.realValue.toLocaleString()} tons CO₂
            </p>
          )}
          {data.predictedValue && (
            <p className="text-blue-400 font-semibold">
              Predicted: {data.predictedValue.toLocaleString()} tons CO₂
            </p>
          )}
          {!data.realValue && !data.predictedValue && (
            <p className="text-gray-400 text-sm">No data available</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use combined emission and prediction data or fallback to mock data
  const combinedData = getCombinedChartData();
  const co2Data =
    combinedData.length > 0
      ? combinedData
      : [
          { time: "00:00", realValue: 1050, predictedValue: null },
          { time: "04:00", realValue: 1200, predictedValue: null },
          { time: "08:00", realValue: 1350, predictedValue: null },
          { time: "12:00", realValue: 1500, predictedValue: 1480 },
          { time: "16:00", realValue: null, predictedValue: 1300 },
          { time: "20:00", realValue: null, predictedValue: 1150 },
          { time: "24:00", realValue: null, predictedValue: 980 },
        ];

  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", active: true },
    { id: "real-time", icon: Shield, label: "Real-Time Monitor", active: false },
    { id: "live-data", icon: Activity, label: "Live Data", active: false },
    { id: "forecast", icon: TrendingUp, label: "Forecast", active: false },
    { id: "tokens", icon: Wallet, label: "Tokens", active: false },
    { id: "reports", icon: FileText, label: "Reports", active: false },
    {
      id: "marketplace",
      icon: ShoppingCart,
      label: "Marketplace",
      active: false,
    },
  ];

  // Generate dynamic compliance alerts based on real data
  const generateComplianceAlerts = () => {
    if (!complianceHistory) return [];

    const alerts = [];
    const {
      currentCompliance,
      complianceFlags,
      activeTimer,
      companyStatus,
      emissionCap,
    } = complianceHistory;

    // Current compliance status alert
    if (currentCompliance) {
      const timeDuration = `${currentCompliance.timeWindowMinutes} minutes`;
      const emissionPercent = (
        (currentCompliance.totalEmissions / currentCompliance.emissionCap) *
        100
      ).toFixed(1);

      if (!currentCompliance.isCompliant) {
        alerts.push({
          type: "error",
          title: "🚨 Threshold Breach Alert",
          description: `Exceeded emission cap by ${currentCompliance.difference.toFixed(
            2
          )} tons in last ${timeDuration}`,
          details: `Current: ${currentCompliance.totalEmissions.toFixed(
            2
          )} tons / Cap: ${
            currentCompliance.emissionCap
          } tons (${emissionPercent}%)`,
          icon: AlertTriangle,
          color: "text-red-400 bg-red-400/10 border-red-400/20",
          timestamp: currentCompliance.timestamp,
        });
      } else {
        alerts.push({
          type: "success",
          title: "✅ Under Compliance",
          description: `${currentCompliance.difference.toFixed(
            2
          )} tons under cap in last ${timeDuration}`,
          details: `Current: ${currentCompliance.totalEmissions.toFixed(
            2
          )} tons / Cap: ${
            currentCompliance.emissionCap
          } tons (${emissionPercent}%)`,
          icon: Shield,
          color: "text-green-400 bg-green-400/10 border-green-400/20",
          timestamp: currentCompliance.timestamp,
        });
      }
    }

    // Smart contract action alerts
    smartContractHistory.forEach((tx) => {
      const timeAgo = Math.floor(
        (Date.now() - tx.timestamp.getTime()) / (1000 * 60)
      );
      if (tx.type === "CREDIT_MINT") {
        alerts.push({
          type: "success",
          title: "💰 Carbon Credits Minted",
          description: `+${tx.amount} CCT minted ${timeAgo} minutes ago`,
          details: `Reason: ${tx.reason}`,
          icon: Award,
          color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
          timestamp: tx.timestamp,
        });
      } else if (tx.type === "CREDIT_DEDUCT") {
        alerts.push({
          type: "warning",
          title: "⚡ Credits Deducted",
          description: `${Math.abs(
            tx.amount
          )} CCT deducted ${timeAgo} minutes ago`,
          details: `Reason: ${tx.reason}`,
          icon: Wallet,
          color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
          timestamp: tx.timestamp,
        });
      }
    });

    // Active buy timer alert
    if (activeTimer && activeTimer.status === "ACTIVE") {
      const timeLeft = Math.max(
        0,
        Math.floor((activeTimer.expiresAt.toDate() - new Date()) / (1000 * 60))
      );
      alerts.push({
        type: "urgent",
        title: "⏰ Buy Credit Timer Active",
        description: `${timeLeft} minutes left to purchase ${activeTimer.creditsRequired} credits`,
        details: `Timer expires at: ${activeTimer.expiresAt
          .toDate()
          .toLocaleTimeString()}`,
        icon: ShoppingCart,
        color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        timestamp: activeTimer.startedAt,
      });
    }

    // Company flagged alert
    if (companyStatus === "FLAGGED" && complianceFlags) {
      const flaggedTime = Math.floor(
        (Date.now() - complianceFlags.flaggedAt.toDate()) / (1000 * 60)
      );
      alerts.push({
        type: "critical",
        title: "🚩 Company Flagged",
        description: `Flagged ${flaggedTime} minutes ago for non-compliance`,
        details: `Reason: ${complianceFlags.reason}`,
        icon: AlertTriangle,
        color: "text-red-500 bg-red-500/20 border-red-500/30",
        timestamp: complianceFlags.flaggedAt,
      });
    }

    // Sort alerts by timestamp (most recent first)
    return alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const complianceAlerts = generateComplianceAlerts();

  // Get company initials for avatar
  const getInitials = (name) => {
    if (!name) return "CC";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      if (companyData?.uid) {
        try {
          console.log("Auto-refreshing data...");
          const balanceResult = await getRealTimeBalance(companyData.uid);
          if (balanceResult.success) {
            setCreditBalance(balanceResult.balance);
          }

          const historyResult = await getSmartContractHistory(companyData.uid, 20);
          if (historyResult.success) {
            setSmartContractHistory(historyResult.transactions);
          }

          const complianceResult = await getComplianceHistory(companyData.uid);
          if (complianceResult.success) {
            setComplianceHistory(complianceResult.history);
          }
        } catch (error) {
          console.error("Error during auto-refresh:", error);
        }
      }
    };

    const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [companyData]);

  // Initial data load
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyData?.uid) return;

      try {
        setIsSyncing(true);
        console.log("🔄 Loading company data...");

        // Fetch real-time balance
        const balanceResult = await getRealTimeBalance(companyData.uid);
        if (balanceResult.success) {
          setCreditBalance(balanceResult.balance);
          console.log("✅ Balance loaded:", balanceResult.balance, "CCT");
        } else {
          console.error("❌ Failed to load balance:", balanceResult.error);
        }

        // Fetch smart contract history
        const historyResult = await getSmartContractHistory(companyData.uid, 20);
        if (historyResult.success) {
          setSmartContractHistory(historyResult.transactions);
          console.log(
            "✅ Smart contract history loaded:",
            historyResult.transactions.length,
            "transactions"
          );
        } else {
          console.error("❌ Failed to load smart contract history:", historyResult.error);
        }

        // Fetch compliance history
        const complianceResult = await getComplianceHistory(companyData.uid);
        if (complianceResult.success) {
          setComplianceHistory(complianceResult.history);
          console.log("✅ Compliance history loaded:", complianceResult.history);
        } else {
          console.error("❌ Failed to load compliance history:", complianceResult.error);
        }
      } catch (error) {
        console.error("❌ Error loading company data:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    loadCompanyData();
  }, [companyData?.uid]);

  return (
    <div className="flex min-h-screen w-full bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-64 glass-sidebar flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate("landing")}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/25">
              <span className="text-white text-lg font-bold">E</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              EcoChain
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "marketplace") onNavigate("marketplace");
                  if (item.id === "reports") onNavigate("reports");
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-white/10">
          <Card className="glass-card border-white/10 rounded-xl">
            <CardContent className="p-4">
              <h4 className="font-semibold text-white mb-2">Need Help?</h4>
              <p className="text-sm text-gray-400 mb-3">
                Our support team is here to assist you.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/10 rounded-lg"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/10 bg-gray-950/95 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>

          <div className="relative ml-auto flex-1 md:grow-0">
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-sm"
              onClick={handleManualRefresh}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : lastSyncTime ? `Synced: ${lastSyncTime}` : "Sync Now"}
            </Button>
          </div>
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-gray-300 hover:bg-white/10 rounded-xl relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
            </Button>

          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Top Section - Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96 mb-6">
            {/* Left Side - Live CO₂ Data Chart (2/3 width) */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/10 rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">
                        Real-time Emissions
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        Last 24 emission records with predictions
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${
                        loadingEmissions
                          ? "text-gray-400"
                          : emissionChange.isPositive
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        !emissionChange.isPositive ? "rotate-180" : ""
                      }`}
                    />
                    <span className="font-medium">
                      {loadingEmissions ? (
                        <div className="animate-pulse bg-gray-600 h-4 w-24 rounded"></div>
                      ) : (
                        <>
                          {emissionChange.isPositive ? "+" : "-"}
                          {emissionChange.value.toFixed(1)}% vs last 5 records
                        </>
                      )}
                    </span>
                    </div>
                  </div>
                  {/* Chart Legend */}
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">Real Data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-1 bg-blue-400 rounded-full opacity-60"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(to right, #3B82F6 0px, #3B82F6 3px, transparent 3px, transparent 6px)",
                        }}
                      ></div>
                      <span className="text-xs text-gray-400">
                        Predictions
                      </span>
                    </div>
                    {(predictionError ||
                      (!loadingPredictions &&
                        predictionData.length === 0)) && (
                      <Button
                        onClick={handleAddSamplePredictions}
                        size="sm"
                        variant="outline"
                        className="ml-auto text-xs h-6 border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
                      >
                        Add Sample Predictions
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loadingEmissions ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">
                            Loading emission data...
                          </p>
                        </div>
                      </div>
                    ) : emissionError ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm mb-3">
                            {emissionError}
                          </p>
                          {emissionError.includes("No emission data") && (
                            <Button
                              onClick={handleAddSampleData}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Add Sample Data
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={co2Data}>
                          <defs>
                            <linearGradient
                              id="realGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10B981"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10B981"
                                stopOpacity={0.05}
                              />
                            </linearGradient>
                            <linearGradient
                              id="predictedGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3B82F6"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3B82F6"
                                stopOpacity={0.05}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey="time"
                            stroke="#9CA3AF"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                              stroke: "#10B981",
                              strokeWidth: 1,
                              strokeDasharray: "3 3",
                            }}
                          />
                          {/* Real emission data */}
                          <Area
                            type="monotone"
                            dataKey="realValue"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#realGradient)"
                            strokeWidth={3}
                            dot={false}
                            connectNulls={false}
                          />
                          {/* Predicted emission data */}
                          <Area
                            type="monotone"
                            dataKey="predictedValue"
                            stroke="#3B82F6"
                            fillOpacity={1}
                            fill="url(#predictedGradient)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            connectNulls={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Cards Column (1/3 width) */}
            <div className="space-y-6">
              {/* Carbon Credits Balance Card */}
              <Card className="glass-card border-white/10 rounded-xl h-48">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white">
                    Carbon Credits Balance (ERC-20)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {balanceUpdated ? (
                          <span className="animate-pulse text-emerald-400">
                            {realTimeBalance.toFixed(0)}
                          </span>
                        ) : (
                          realTimeBalance.toFixed(0)
                        )}{" "}
                        <span className="text-lg text-gray-400">CCT</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      onClick={() => {/* Handle view wallet */}}
                    >
                      View Wallet →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Emissions Forecast Card */}
              <Card className="glass-card border-white/10 rounded-xl h-44">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white">
                    AI Emissions Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        1,280 <span className="text-sm text-gray-400">tons</span>
                      </div>
                      <div className="text-xs text-gray-400">Next 30 Days Projection</div>
                    </div>
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Potential threshold breach</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Compliance Status Alert - moved outside the main grid */}
          {complianceStatus && (
            <div className="mb-6">
              <Card
                className={`glass-card border-white/10 rounded-xl ${
                  complianceStatus.action === "CREDITS_MINTED"
                    ? "border-green-400/20 bg-green-900/10"
                    : complianceStatus.action === "BUY_TIMER_STARTED"
                    ? "border-yellow-400/20 bg-yellow-900/10"
                    : "border-red-400/20 bg-red-900/10"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {complianceStatus.action === "CREDITS_MINTED" ? (
                      <Award className="w-6 h-6 text-green-400" />
                    ) : complianceStatus.action === "BUY_TIMER_STARTED" ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    )}

                    <div className="flex-1">
                      {complianceStatus.action === "CREDITS_MINTED" && (
                        <div>
                          <h4 className="font-semibold text-green-400 mb-1">
                            Credits Minted Successfully
                          </h4>
                          <p className="text-sm text-gray-300">
                            {complianceStatus.amount.toFixed(1)} credits added
                            to your wallet for compliance
                          </p>
                        </div>
                      )}

                      {complianceStatus.action === "BUY_TIMER_STARTED" && (
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-1">
                            Credit Purchase Required
                          </h4>
                          <p className="text-sm text-gray-300 mb-2">
                            Need{" "}
                            {complianceStatus.creditsRequired.toFixed(1)}{" "}
                            credits. Current balance:{" "}
                            {complianceStatus.currentBalance.toFixed(1)}
                          </p>
                          {buyTimer && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-yellow-400">
                                {Math.floor(
                                  buyTimer.timeRemaining / 1000 / 60
                                )}
                                :
                                {String(
                                  Math.floor(
                                    (buyTimer.timeRemaining / 1000) % 60
                                  )
                                ).padStart(2, "0")}{" "}
                                remaining
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {complianceStatus.action === "CREDITS_DEDUCTED" && (
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">
                            Credits Deducted
                          </h4>
                          <p className="text-sm text-gray-300">
                            {complianceStatus.amount.toFixed(1)} credits
                            deducted for exceeding emission cap
                          </p>
                        </div>
                      )}
                    </div>

                    {complianceStatus.action === "BUY_TIMER_STARTED" && (
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() =>
                          handlePurchaseCredits(
                            complianceStatus.creditsRequired
                          )
                        }
                      >
                        Buy Credits
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bottom Section - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Alerts */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCompliance ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse p-4 rounded-xl border border-gray-600/20 bg-gray-600/10"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gray-600 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : complianceAlerts.length > 0 ? (
                  complianceAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${alert.color} transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start space-x-3">
                        <alert.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {alert.title}
                            </h4>
                            <span className="text-xs opacity-60 ml-2 flex-shrink-0">
                              {alert.timestamp
                                ? new Date(
                                    alert.timestamp
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "Now"}
                            </span>
                          </div>
                          <p className="text-sm opacity-80 mb-1">
                            {alert.description}
                          </p>
                          {alert.details && (
                            <p className="text-xs opacity-60 font-mono">
                              {alert.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No compliance alerts</p>
                    <p className="text-gray-500 text-sm">
                      All systems operating normally
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white">
                    Recent Transactions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-400 border-b border-white/10 pb-2">
                    <span>Date</span>
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-300">2024-07-20</span>
                    <span className="text-gray-400">Credit Purchase</span>
                    <span className="text-emerald-400">+500 CCT</span>
                    <Badge className="bg-emerald-600 text-white">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
              <Card className="glass-card border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <CardDescription className="text-gray-400 mb-4">
                    Carbon Credits Balance (ERC-20)
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-white mb-4">
                    {loadingBalance ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-gray-600 h-8 w-20 rounded"></div>
                        <span className="text-lg font-normal text-gray-400">
                          CCT
                        </span>
                      </div>
                    ) : balanceError ? (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        <span className="text-lg text-yellow-400">
                          {companyData?.creditBalance || 0}
                        </span>
                        <span className="text-lg font-normal text-gray-400">
                          CCT
                        </span>
                      </div>
                    ) : (
                      <>
                        {realTimeBalance.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-lg font-normal text-gray-400">
                          CCT
                        </span>
                      </>
                    )}
                  </CardTitle>
                  {balanceError && (
                    <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-400">
                        ⚠️ Using cached balance (blockchain error)
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25">
                      View Wallet →
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleRunComplianceCheck}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm"
                      >
                        Check Compliance
                      </Button>
                      <Button
                        onClick={async () => {
                          setLoadingBalance(true);
                          setBalanceError(null);
                          try {
                            const balanceResult = await getRealTimeBalance(
                              companyData.uid
                            );
                            if (balanceResult.success) {
                              setRealTimeBalance(balanceResult.balance);
                            } else {
                              setBalanceError(balanceResult.error);
                            }
                          } catch (error) {
                            setBalanceError(error.message);
                          } finally {
                            setLoadingBalance(false);
                          }
                        }}
                        disabled={loadingBalance}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl text-sm"
                      >
                        {loadingBalance ? "🔄" : "↻"} Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Forecast */}
              <Card className="glass-card border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription className="text-gray-400">
                      AI Emissions Forecast
                    </CardDescription>
                    <button
                      onClick={async () => {
                        setLoadingPredictions(true);
                        setPredictionError(null);
                        try {
                          console.log("🔄 Refreshing prediction data...");
                          const result = await getCompanyPredictions(
                            companyData.uid,
                            24
                          );
                          if (
                            result.success &&
                            result.predictions.length > 0
                          ) {
                            // Format data for the chart (same as initial load)
                            const chartData = result.predictions.map(
                              (prediction) => ({
                                time: prediction.date.toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                ),
                                value: prediction.predictedValue,
                                date: prediction.date,
                                id: prediction.id,
                              })
                            );

                            setPredictionData(chartData);
                            setPredictionError(null);
                            console.log(
                              "✅ Prediction data refreshed successfully"
                            );
                          } else {
                            setPredictionError(
                              result.error || "No prediction data available"
                            );
                          }
                        } catch (error) {
                          console.error(
                            "❌ Error refreshing prediction data:",
                            error
                          );
                          setPredictionError(error.message);
                        } finally {
                          setLoadingPredictions(false);
                        }
                      }}
                      disabled={loadingPredictions}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh forecast data"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-gray-400 ${
                          loadingPredictions ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <CardTitle className="text-3xl font-bold text-white mb-3">
                    {loadingPredictions ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-gray-600 h-8 w-16 rounded"></div>
                        <span className="text-lg font-normal text-gray-400">
                          tons
                        </span>
                      </div>
                    ) : (
                      <>
                        {predictionMetrics.nextMinutePrediction.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 1 }
                        )}{" "}
                        <span className="text-lg font-normal text-gray-400">
                          tons
                        </span>
                      </>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mb-3">
                    {loadingPredictions
                      ? "Loading forecast..."
                      : predictionMetrics.latestPredictionTime
                      ? `Next minute prediction (${predictionMetrics.latestPredictionTime})`
                      : "Next minute prediction"}
                  </p>
                  <div className="flex items-center space-x-2">
                    {loadingPredictions ? (
                      <div className="animate-pulse bg-gray-600 h-4 w-32 rounded"></div>
                    ) : predictionError ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-medium">
                          No prediction data
                        </span>
                      </>
                    ) : predictionMetrics.trend === "increasing" ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">
                          Increasing trend detected
                        </span>
                      </>
                    ) : predictionMetrics.trend === "decreasing" ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />
                        <span className="text-sm text-green-400 font-medium">
                          Decreasing trend
                        </span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">
                          Stable emissions forecast
                        </span>
                      </>
                    )}
                  </div>
                  {predictionError &&
                    predictionError.includes("No prediction data") && (
                      <div className="mt-3">
                        <Button
                          onClick={handleAddSamplePredictions}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                        >
                          Generate Forecast
                        </Button>
                      </div>
                    )}
                  {/* Mini prediction trend chart */}
                  {!loadingPredictions &&
                    !predictionError &&
                    predictionData.length > 0 && (
                      <div className="mt-4 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={predictionData.slice(0, 12)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={false}
                              strokeDasharray="3 3"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Compliance Service Status - READ ONLY */}
              <Card className="glass-card border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <CardDescription className="text-gray-400 mb-4">
                    Backend Compliance Service
                  </CardDescription>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Service Status
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs font-medium text-green-400">
                          RUNNING
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Monitoring Type
                      </span>
                      <span className="text-xs text-blue-400">
                        24/7 Automated
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Check Interval
                      </span>
                      <span className="text-xs text-gray-400">
                        Every 5 minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Your Status
                      </span>
                      <span className="text-xs text-emerald-400">
                        MONITORED
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400">
                            Backend Service
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          This compliance monitoring service runs
                          automatically in the backend. Companies cannot start
                          or stop this service. Only system administrators can
                          control this system-wide compliance monitoring.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Compliance Alerts */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCompliance ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse p-4 rounded-xl border border-gray-600/20 bg-gray-600/10"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gray-600 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : complianceAlerts.length > 0 ? (
                  complianceAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${alert.color} transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start space-x-3">
                        <alert.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {alert.title}
                            </h4>
                            <span className="text-xs opacity-60 ml-2 flex-shrink-0">
                              {alert.timestamp
                                ? new Date(
                                    alert.timestamp
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "Now"}
                            </span>
                          </div>
                          <p className="text-sm opacity-80 mb-1">
                            {alert.description}
                          </p>
                          {alert.details && (
                            <p className="text-xs opacity-60 font-mono">
                              {alert.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No compliance alerts</p>
                    <p className="text-gray-500 text-sm">
                      All systems operating normally
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Contract Transactions */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white">
                    Smart Contract Activity
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <NextComplianceCountdown />
                    <button
                      onClick={async () => {
                        setLoadingCompliance(true);
                        try {
                          console.log(
                            "🔄 Refreshing smart contract activity..."
                          );
                          // Only fetch smart contract history, skip compliance history for faster refresh
                          const contractResult =
                            await getSmartContractHistory(
                              companyData.uid,
                              20
                            );

                          if (contractResult.success) {
                            setSmartContractHistory(
                              contractResult.transactions
                            );
                            console.log(
                              "✅ Smart contract history refreshed:",
                              contractResult.transactions.length,
                              "transactions"
                            );
                            console.log(
                              "📋 Transactions loaded:",
                              contractResult.transactions.map(
                                (tx) => `${tx.type}: ${tx.amount} CCT`
                              )
                            );
                          } else {
                            console.error(
                              "❌ Failed to fetch smart contract history:",
                              contractResult.error
                            );

                            // Try loading test company data as fallback
                            console.log("🔄 Trying test company data...");
                            const testResult = await getSmartContractHistory(
                              "complete-test-001"
                            );
                            if (
                              testResult.success &&
                              testResult.transactions.length > 0
                            ) {
                              setSmartContractHistory(
                                testResult.transactions
                              );
                              console.log(
                                "✅ Test company smart contract history loaded:",
                                testResult.transactions.length,
                                "transactions"
                              );
                              console.log(
                                "📋 Test transactions loaded:",
                                testResult.transactions.map(
                                  (tx) => `${tx.type}: ${tx.amount} CCT`
                                )
                              );
                            } else {
                              console.log(
                                "❌ No test company data available either"
                              );
                              // Clear the history if nothing is found
                              setSmartContractHistory([]);
                            }
                          }
                        } catch (error) {
                          console.error(
                            "❌ Error refreshing smart contract activity:",
                            error
                          );
                        } finally {
                          setLoadingCompliance(false);
                        }
                      }}
                      disabled={loadingCompliance}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh smart contract activity"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-gray-400 ${
                          loadingCompliance ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
                </CardHeader>
                <CardContent>
                  {loadingCompliance ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse grid grid-cols-4 gap-4 py-2"
                        >
                          <div className="h-4 bg-gray-600 rounded"></div>
                          <div className="h-4 bg-gray-600 rounded"></div>
                          <div className="h-4 bg-gray-600 rounded"></div>
                          <div className="h-4 bg-gray-600 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : smartContractHistory.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-400 border-b border-white/10 pb-2">
                        <div>Time</div>
                        <div>Action</div>
                        <div>Amount</div>
                        <div>Balance After</div>
                        <div>Status</div>
                      </div>
                      {smartContractHistory.map((transaction, index) => (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-5 gap-4 items-center py-2 text-sm hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors"
                        >
                          <div className="text-gray-300">
                            {transaction.timestamp.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </div>
                          <div className="text-white">
                            {transaction.type === "CREDIT_MINT"
                              ? "🪙 Mint"
                              : transaction.type === "CREDIT_DEDUCT"
                              ? "⚡ Deduct"
                              : transaction.type === "CREDIT_PURCHASE"
                              ? "💳 Purchase"
                              : transaction.type === "INITIAL_MINT"
                              ? "🎯 Initial"
                              : transaction.type === "COMPLIANCE_MINT"
                              ? "✅ Compliance"
                              : transaction.type}
                          </div>
                          <div
                            className={`font-medium ${
                              transaction.amount > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {Math.abs(transaction.amount)} CCT
                          </div>
                          <div className="text-blue-400 font-mono text-xs">
                            {transaction.balanceAfter?.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 }
                            ) || "0"}{" "}
                            CCT
                          </div>
                          <div>
                            <Badge
                              className={`text-xs rounded-lg ${
                                transaction.status === "CONFIRMED"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : transaction.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {smartContractHistory.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-gray-500 text-center">
                            Latest blockchain transactions for automated
                            compliance
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">
                        No smart contract activity
                      </p>
                      <p className="text-gray-500 text-sm">
                        Blockchain transactions will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Compliance Alerts */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Real-Time Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Click "Real-Time Monitor" tab to view live emission compliance data</p>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card className="glass-card border-white/10 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  System Status  
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Emission monitor running every 5 minutes</p>
                {realTimeComplianceData.length > 0 && (
                  <p className="text-green-400 text-sm mt-2">
                    Monitoring {realTimeComplianceData.length} companies
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Real-Time Monitoring Tab - separate from dashboard */}
          {activeTab === "real-time" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Real-Time Emission Monitor</h2>
                  <p className="text-gray-400 mt-1">Live compliance monitoring for all companies</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    Last updated: {lastSyncTime || 'Loading...'}
                  </div>
                  <Button
                    onClick={handleManualRefresh}
                    disabled={isSyncing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isSyncing ? 'Syncing...' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* Company Compliance Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loadingRealTimeData ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                      <p className="text-gray-400">Loading real-time compliance data...</p>
                    </div>
                  </div>
                ) : realTimeComplianceData.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No companies with active monitoring</p>
                    <p className="text-gray-500 text-sm">Companies with wallet addresses will appear here</p>
                  </div>
                ) : (
                  realTimeComplianceData.map((company) => (
                    <Card key={company.id} className="glass-card border-white/10 rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold text-white">{company.name}</CardTitle>
                            <p className="text-gray-400 text-sm">{company.email}</p>
                          </div>
                          <Badge 
                            variant={company.isCompliant ? "default" : "destructive"}
                            className={company.isCompliant ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                          >
                            {company.isCompliant ? "COMPLIANT" : "EXCEEDED"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Total Emissions</p>
                            <p className="text-lg font-semibold text-white">{company.totalEmissions.toFixed(2)} tons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Emission Cap</p>
                            <p className="text-lg font-semibold text-white">{company.emissionCap} tons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Credit Balance</p>
                            <p className="text-lg font-semibold text-white">{company.creditBalance} CCT</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Wallet Address</p>
                            <p className="text-xs font-mono text-gray-300">{company.walletAddress.slice(0, 8)}...{company.walletAddress.slice(-6)}</p>
                          </div>
                        </div>
                        
                        {!company.isCompliant && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <p className="text-sm text-red-400 font-medium">
                                Excess Emissions: {company.excessEmissions.toFixed(2)} tons
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Credits may be deducted based on excess emissions
                            </p>
                          </div>
                        )}

                        {company.lastBalanceUpdate && (
                          <div className="text-xs text-gray-500">
                            Last updated: {company.lastBalanceUpdate.toLocaleString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Recent Emission Transactions */}
              <Card className="glass-card border-white/10 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Recent Emission Transactions</CardTitle>
                  <p className="text-gray-400 text-sm">Latest balance changes based on emission compliance</p>
                </CardHeader>
                <CardContent>
                  {emissionTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No emission transactions yet</p>
                      <p className="text-gray-500 text-sm">Compliance-based balance changes will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {emissionTransactions.slice(0, 10).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {transaction.companyName?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{transaction.companyName}</p>
                              <p className="text-xs text-gray-400">{transaction.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${transaction.balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.balanceChange >= 0 ? '+' : ''}{transaction.balanceChange} CCT
                            </p>
                            <p className="text-xs text-gray-400">{transaction.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
