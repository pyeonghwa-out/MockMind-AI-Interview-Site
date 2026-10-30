import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Step1SetUp from '../components/Step1SetUp';
import Step2Interview from '../components/Step2Interview';
import Step3Report from '../components/Step3Report';
import LowCreditModal from '../components/LowCreditModal';

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);
  const { userData } = useSelector((state) => state.user);
  const [showLowCreditModal, setShowLowCreditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If userData is loaded and credits are below 50, show low credit modal
    if (userData && (userData.credits ?? 0) < 50) {
      setShowLowCreditModal(true);
    }
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report
          report={interviewData}
        />
      )}

      <LowCreditModal
        isOpen={showLowCreditModal}
        onClose={() => {
          setShowLowCreditModal(false);
          navigate("/");
        }}
        credits={userData?.credits || 0}
      />

    </div>
  );
}

export default InterviewPage;