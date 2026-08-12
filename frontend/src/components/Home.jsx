import React from 'react';
import { User, Phone, MapPin, Activity, Calendar, LogOut, Stethoscope, FileText, HeartPulse } from 'lucide-react';
import logoImg from '../assets/Logo.jpeg';

export default function Home({ user, onLogout }) {
  return (
    <div className="homepage-container">
      {/* Top Portal Navigation Header */}
      <nav className="home-nav">
        <div className="home-brand">
          <div className="brand-logo-wrapper sm">
            <img src={logoImg} alt="Sanjeevani Logo" className="brand-logo-img sm" />
          </div>
          <span className="home-title">SANJEEVANI PORTAL</span>
        </div>

        <button className="btn-logout" onClick={onLogout} aria-label="Sign Out">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </nav>

      <div className="home-content">
        {/* Patient Welcome Hero */}
        <section className="welcome-card">
          <div className="user-avatar-badge">
            <User size={36} className="avatar-icon" />
          </div>
          <div className="welcome-info">
            <span className="verified-badge">✓ Verified Patient</span>
            <h2>Welcome back, {user?.fullName || 'Patient'}!</h2>
            <p className="welcome-subtext">
              Your identity has been verified via Sanjeevani Face Recognition.
            </p>
          </div>
        </section>

        {/* Patient Information Grid */}
        <div className="home-grid">
          {/* Profile Card */}
          <div className="home-card profile-card">
            <h3>
              <Activity size={20} className="card-icon" />
              Patient Profile
            </h3>

            <ul className="info-list">
              <li>
                <User size={16} className="info-icon" />
                <span className="label">Full Name:</span>
                <span className="value">{user?.fullName || 'N/A'}</span>
              </li>
              <li>
                <Phone size={16} className="info-icon" />
                <span className="label">Mobile Number:</span>
                <span className="value">{user?.mobile || 'N/A'}</span>
              </li>
              <li>
                <MapPin size={16} className="info-icon" />
                <span className="label">Village Code:</span>
                <span className="value">{user?.villageCode || 'N/A'}</span>
              </li>
              <li>
                <Calendar size={16} className="info-icon" />
                <span className="label">Last Visit:</span>
                <span className="value">
                  {user?.lastConsultation
                    ? new Date(user.lastConsultation).toLocaleDateString()
                    : 'Today'}
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Health Actions */}
          <div className="home-card actions-card">
            <h3>
              <HeartPulse size={20} className="card-icon" />
              Healthcare Services
            </h3>

            <div className="action-buttons-grid">
              <button className="service-btn primary">
                <Stethoscope size={22} />
                <span>Start AI Consultation</span>
              </button>
              <button className="service-btn secondary">
                <FileText size={22} />
                <span>Medical Records</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
