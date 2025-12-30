'use client';

import { useState } from 'react';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  allowSignup: boolean;
  requireEmailVerification: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  force2FA: boolean;
  logActivity: boolean;
}

interface NotificationSettings {
  notifyNewUser: boolean;
  notifyReport: boolean;
  notifyError: boolean;
  showBanner: boolean;
  bannerMessage: string;
}

interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  encryption: 'tls' | 'ssl' | 'none';
  senderEmail: string;
  smtpPassword: string;
}

interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General Settings
  const [general, setGeneral] = useState<GeneralSettings>({
    siteName: 'K-OSP 오픈소스포털',
    siteDescription: 'KOREATECH 오픈소스 포털 서비스',
    adminEmail: 'admin@koreatech.ac.kr',
    allowSignup: true,
    requireEmailVerification: true,
  });

  // Security Settings
  const [security, setSecurity] = useState<SecuritySettings>({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    force2FA: false,
    logActivity: true,
  });

  // Notification Settings
  const [notification, setNotification] = useState<NotificationSettings>({
    notifyNewUser: true,
    notifyReport: true,
    notifyError: true,
    showBanner: false,
    bannerMessage: '',
  });

  // Email Settings
  const [email, setEmail] = useState<EmailSettings>({
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    encryption: 'tls',
    senderEmail: 'noreply@koreatech.ac.kr',
    smtpPassword: '',
  });

  // Maintenance Settings
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    maintenanceMode: false,
    maintenanceMessage: '현재 시스템 점검 중입니다. 잠시 후 다시 이용해주세요.',
  });

  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveGeneral = () => {
    // Mock save operation
    console.log('Saving general settings:', general);
    showSaveMessage('success', '일반 설정이 저장되었습니다.');
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', security);
    showSaveMessage('success', '보안 설정이 저장되었습니다.');
  };

  const handleSaveNotification = () => {
    console.log('Saving notification settings:', notification);
    showSaveMessage('success', '알림 설정이 저장되었습니다.');
  };

  const handleSaveEmail = () => {
    console.log('Saving email settings:', email);
    showSaveMessage('success', '이메일 설정이 저장되었습니다.');
  };

  const handleSaveMaintenance = () => {
    console.log('Saving maintenance settings:', maintenance);
    showSaveMessage('success', '유지보수 설정이 저장되었습니다.');
  };

  const handleTestEmail = () => {
    showSaveMessage('success', '테스트 이메일이 발송되었습니다.');
  };

  const handleClearCache = () => {
    showSaveMessage('success', '캐시가 초기화되었습니다.');
  };

  const handleBackupDatabase = () => {
    showSaveMessage('success', '데이터베이스 백업이 시작되었습니다.');
  };

  const handleDeleteTempFiles = () => {
    showSaveMessage('success', '임시 파일이 삭제되었습니다.');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="mb-1">설정</h4>
        <p className="text-muted mb-0">사이트 설정을 관리합니다</p>
      </div>

      {/* Save Message Toast */}
      {saveMessage && (
        <div
          className={`alert alert-${saveMessage.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
          style={{ top: '20px', right: '20px', zIndex: 9999 }}
        >
          <i className={`bi bi-${saveMessage.type === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
          {saveMessage.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSaveMessage(null)}
          ></button>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="row">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-gear me-2"></i>
                일반 설정
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock me-2"></i>
                보안 설정
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'notification' ? 'active' : ''}`}
                onClick={() => setActiveTab('notification')}
              >
                <i className="bi bi-bell me-2"></i>
                알림 설정
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                <i className="bi bi-envelope me-2"></i>
                이메일 설정
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
              >
                <i className="bi bi-tools me-2"></i>
                유지보수
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">일반 설정</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label">사이트 이름</label>
                  <input
                    type="text"
                    className="form-control"
                    value={general.siteName}
                    onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">사이트 설명</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={general.siteDescription}
                    onChange={(e) => setGeneral({ ...general, siteDescription: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label">관리자 이메일</label>
                  <input
                    type="email"
                    className="form-control"
                    value={general.adminEmail}
                    onChange={(e) => setGeneral({ ...general, adminEmail: e.target.value })}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowSignup"
                    checked={general.allowSignup}
                    onChange={(e) => setGeneral({ ...general, allowSignup: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="allowSignup">
                    회원가입 허용
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={general.requireEmailVerification}
                    onChange={(e) => setGeneral({ ...general, requireEmailVerification: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="requireEmailVerification">
                    이메일 인증 필수
                  </label>
                </div>
                <button className="btn btn-primary" onClick={handleSaveGeneral}>
                  <i className="bi bi-check-lg me-1"></i>
                  저장
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">보안 설정</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label">세션 만료 시간 (분)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                    style={{ width: '200px' }}
                    min={5}
                    max={480}
                  />
                  <small className="text-muted">5분 ~ 480분 (8시간) 사이로 설정하세요</small>
                </div>
                <div className="mb-4">
                  <label className="form-label">최대 로그인 시도 횟수</label>
                  <input
                    type="number"
                    className="form-control"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) })}
                    style={{ width: '200px' }}
                    min={3}
                    max={10}
                  />
                  <small className="text-muted">초과 시 계정이 일시 잠금됩니다</small>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="force2FA"
                    checked={security.force2FA}
                    onChange={(e) => setSecurity({ ...security, force2FA: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="force2FA">
                    2단계 인증 필수
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="logActivity"
                    checked={security.logActivity}
                    onChange={(e) => setSecurity({ ...security, logActivity: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="logActivity">
                    활동 로그 기록
                  </label>
                </div>
                <button className="btn btn-primary" onClick={handleSaveSecurity}>
                  <i className="bi bi-check-lg me-1"></i>
                  저장
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notification' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">알림 설정</h5>
              </div>
              <div className="card-body">
                <h6 className="mb-3">관리자 알림</h6>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyNewUser"
                    checked={notification.notifyNewUser}
                    onChange={(e) => setNotification({ ...notification, notifyNewUser: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="notifyNewUser">
                    새 사용자 가입 시 알림
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyReport"
                    checked={notification.notifyReport}
                    onChange={(e) => setNotification({ ...notification, notifyReport: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="notifyReport">
                    새 신고 접수 시 알림
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyError"
                    checked={notification.notifyError}
                    onChange={(e) => setNotification({ ...notification, notifyError: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="notifyError">
                    시스템 오류 발생 시 알림
                  </label>
                </div>
                <hr />
                <h6 className="mb-3">공지사항 배너</h6>
                <div className="mb-3">
                  <label className="form-label">배너 메시지</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="상단에 표시할 공지 메시지"
                    value={notification.bannerMessage}
                    onChange={(e) => setNotification({ ...notification, bannerMessage: e.target.value })}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showBanner"
                    checked={notification.showBanner}
                    onChange={(e) => setNotification({ ...notification, showBanner: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="showBanner">
                    공지 배너 표시
                  </label>
                </div>
                {notification.showBanner && notification.bannerMessage && (
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>미리보기:</strong> {notification.bannerMessage}
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleSaveNotification}>
                  <i className="bi bi-check-lg me-1"></i>
                  저장
                </button>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">이메일 설정</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label">SMTP 서버</label>
                  <input
                    type="text"
                    className="form-control"
                    value={email.smtpServer}
                    onChange={(e) => setEmail({ ...email, smtpServer: e.target.value })}
                  />
                </div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">SMTP 포트</label>
                    <input
                      type="number"
                      className="form-control"
                      value={email.smtpPort}
                      onChange={(e) => setEmail({ ...email, smtpPort: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">암호화</label>
                    <select
                      className="form-select"
                      value={email.encryption}
                      onChange={(e) => setEmail({ ...email, encryption: e.target.value as EmailSettings['encryption'] })}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">없음</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">발신자 이메일</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email.senderEmail}
                    onChange={(e) => setEmail({ ...email, senderEmail: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">SMTP 비밀번호</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={email.smtpPassword}
                    onChange={(e) => setEmail({ ...email, smtpPassword: e.target.value })}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={handleSaveEmail}>
                    <i className="bi bi-check-lg me-1"></i>
                    저장
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleTestEmail}>
                    <i className="bi bi-envelope me-1"></i>
                    테스트 이메일 발송
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === 'maintenance' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">유지보수</h5>
              </div>
              <div className="card-body">
                <div className={`alert ${maintenance.maintenanceMode ? 'alert-danger' : 'alert-warning'}`}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {maintenance.maintenanceMode
                    ? '유지보수 모드가 활성화되어 있습니다. 관리자를 제외한 모든 사용자의 접근이 차단됩니다.'
                    : '유지보수 모드를 활성화하면 관리자를 제외한 모든 사용자의 접근이 차단됩니다.'}
                </div>
                <div className="form-check form-switch mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="maintenanceMode"
                    checked={maintenance.maintenanceMode}
                    onChange={(e) => setMaintenance({ ...maintenance, maintenanceMode: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="maintenanceMode">
                    유지보수 모드 활성화
                  </label>
                </div>
                <div className="mb-4">
                  <label className="form-label">유지보수 안내 메시지</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={maintenance.maintenanceMessage}
                    onChange={(e) => setMaintenance({ ...maintenance, maintenanceMessage: e.target.value })}
                  ></textarea>
                </div>
                <button className="btn btn-primary mb-4" onClick={handleSaveMaintenance}>
                  <i className="bi bi-check-lg me-1"></i>
                  저장
                </button>
                <hr />
                <h6 className="mb-3">시스템 관리</h6>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-outline-secondary" onClick={handleClearCache}>
                    <i className="bi bi-arrow-repeat me-1"></i>
                    캐시 초기화
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleBackupDatabase}>
                    <i className="bi bi-database me-1"></i>
                    데이터베이스 백업
                  </button>
                  <button className="btn btn-outline-danger" onClick={handleDeleteTempFiles}>
                    <i className="bi bi-trash me-1"></i>
                    임시 파일 삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
