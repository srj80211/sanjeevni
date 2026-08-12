import React, { useState, useEffect } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { QueueSkeleton } from './SkeletonLoader';
import { translations } from '../utils/translations';
import { getMyLatestConsultation, updateConsultationStatus } from '../services/consultationService';
import { Clock, Users, CheckCircle2, ShieldCheck, Bell, FileCheck, ArrowRight, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function QueueStatusScreen({
  token,
  lang = 'en',
  onLangChange,
  onLeaveQueue,
  onDoctorReady
}) {
  const t = translations[lang] || translations.en;
  const [queuePosition, setQueuePosition] = useState(2);
  const [estimatedWait, setEstimatedWait] = useState(10);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchQueueData = async () => {
    try {
      const res = await getMyLatestConsultation(token);
      if (res.success && res.data) {
        if (res.data.queuePosition !== undefined) {
          setQueuePosition(res.data.queuePosition);
        }
        if (res.data.estimatedWaitMinutes !== undefined) {
          setEstimatedWait(res.data.estimatedWaitMinutes);
        }
        if (res.data.consultation) {
          setConsultation(res.data.consultation);
          // If status moved to Awaiting_Doctor or Consultation_Complete, trigger transition
          if (res.data.consultation.status === 'Awaiting_Doctor' || res.data.consultation.status === 'Consultation_Complete') {
            onDoctorReady(res.data.consultation);
          }
        }
      }
    } catch (err) {
      console.error("Queue poll error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    // Poll queue status every 4 seconds to get real live rank
    const interval = setInterval(() => {
      fetchQueueData();
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCancelQueue = async () => {
    if (!consultation?._id) {
      onLeaveQueue();
      return;
    }
    setCancelling(true);
    try {
      await updateConsultationStatus(consultation._id, 'Medicine_Delivered', token);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
      onLeaveQueue();
    }
  };

  const steps = [
    { label: t.step1, status: 'completed' },
    { label: t.step2, status: 'completed' },
    { label: t.step3, status: queuePosition <= 1 ? 'completed' : 'active' },
    { label: t.step4, status: queuePosition <= 1 ? 'active' : 'pending' },
  ];

  const speechText = `You are currently in position ${queuePosition} in the queue. Estimated wait time is ${estimatedWait} minutes. Please stay on this screen.`;

  return (
    <div className="screen-container">
      <Header
        currentLang={lang}
        onLangChange={onLangChange}
        textToSpeak={speechText}
        speechLabel={t.listen}
      />

      <main className="main-content">
        {loading ? (
          <QueueSkeleton />
        ) : (
          <div className="card-wrapper animate-fade-in text-center">
            {/* Main Centered Queue Heading */}
            <div className="queue-hero">
              <div className="queue-pulse-ring-wrapper">
                <div className="pulse-outer-ring" />
                <div className="pulse-inner-icon">
                  <Users size={32} />
                </div>
              </div>
              <h2 className="queue-title">{t.youreInQueue}</h2>
              <p className="queue-sub">{t.queueSub}</p>
            </div>

            {/* Stat Blocks Grid */}
            <div className="stat-blocks-grid">
              <div className="stat-card primary-stat animate-fade-in stagger-1">
                <span className="stat-label">{t.yourPosition}</span>
                <div className="stat-value-group">
                  <span className="stat-number">#{queuePosition}</span>
                  <span className="stat-badge">Live</span>
                </div>
              </div>

              <div className="stat-card secondary-stat animate-fade-in stagger-2">
                <span className="stat-label">{t.estimatedWait}</span>
                <div className="stat-value-group">
                  <Clock size={24} className="stat-icon" />
                  <span className="stat-number">~{estimatedWait} mins</span>
                </div>
              </div>
            </div>

            {/* 4-Step Progress Tracker */}
            <div className="progress-tracker-container animate-fade-in stagger-3">
              <div className="tracker-track">
                {steps.map((step, idx) => (
                  <div key={idx} className={`tracker-step ${step.status}`}>
                    <div className="step-circle">
                      {step.status === 'completed' ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="step-text">{step.label}</span>
                    {idx < steps.length - 1 && <div className="step-connector" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Reassurance Info Panel */}
            <div className="reassurance-panel animate-fade-in stagger-4">
              <div className="reassurance-item">
                <FileCheck size={20} className="reassurance-icon" />
                <span>Health card ready for attending doctor review</span>
              </div>
              <div className="reassurance-item">
                <Bell size={20} className="reassurance-icon" />
                <span>You will be automatically connected when the doctor joins</span>
              </div>
              <div className="reassurance-item">
                <ShieldCheck size={20} className="reassurance-icon" />
                <span>All communication is 100% confidential and encrypted</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="screen-actions flex-between">
              <button
                className="btn-secondary danger-hover"
                onClick={handleCancelQueue}
                disabled={cancelling}
              >
                <XCircle size={18} />
                <span>{cancelling ? 'Leaving...' : t.leaveQueue}</span>
              </button>

              <button className="btn-primary" onClick={() => onDoctorReady(consultation)}>
                <span>Join Doctor Now</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
