import React, { useState } from "react";
import ErrorBoundary from "./ErrorBoundary.jsx";
import LandingPage from "./HeroSection.jsx";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";
import CompanyDetailsForm from "./CompanyDetailsForm.jsx";
import VerificationPendingPage from "./VerificationPendingPage.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import CompanyVerificationPage from "./CompanyVerificationPage.jsx";
import { CompanyLoginDashboard } from "./CompanyLoginDashboard.jsx";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [pageData, setPageData] = useState(null);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "signup":
        return <SignupPage onNavigate={handleNavigate} />;
      case "company-details":
        return (
          <CompanyDetailsForm
            onNavigate={handleNavigate}
            user={pageData?.user}
          />
        );
      case "verification-pending":
        return <VerificationPendingPage onNavigate={handleNavigate} />;
      case "admin-login":
        return <AdminLogin onNavigate={handleNavigate} />;
      case "admin-dashboard":
        return <AdminDashboard onNavigate={handleNavigate} />;
      case "company-verification":
        return (
          <CompanyVerificationPage
            onNavigate={handleNavigate}
            company={pageData?.company}
          />
        );
      case "company-dashboard":
        return <CompanyLoginDashboard onNavigate={handleNavigate} />;
      case "landing":
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return <ErrorBoundary>{renderPage()}</ErrorBoundary>;
}

export default App;
