// // src/App.jsx
// import { Routes, Route, Navigate } from "react-router-dom";

// import Login from "./pages/Login.jsx";
// import Signup from "./pages/Signup.jsx";
// import FindID from "./pages/FindID.jsx";
// import FindPassword from "./pages/FindPassword.jsx";
// import MainPage from "./pages/MainPage.jsx";
// import DiagnosisHome from "./pages/DiagnosisHome.jsx";
// import EasyLogin from "./pages/EasyLogin.jsx";
// import BrandConsulting from "./pages/BrandConsulting.jsx";
// import DiagnosisInterview from "./pages/DiagnosisInterview.jsx";

// import NamingConsultingInterview from "./pages/NamingConsultingInterview.jsx";
// import LogoConsultingInterview from "./pages/LogoConsultingInterview.jsx";

// // ✅ 여기 오타 주의: Hompage -> Homepage (파일명에 맞춰서 사용)
// import HomepageConsultingInterview from "./pages/HomepageConsultingInterview.jsx";
// // import HomepageConsultingInterview from "./pages/HompageConsultingInterview.jsx";

// export default function App() {
//   return (
//     <Routes>
//       {/* 로그인/메인 */}
//       <Route path="/" element={<Login />} />
//       <Route path="/main" element={<MainPage />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/findid" element={<FindID />} />
//       <Route path="/findpw" element={<FindPassword />} />
//       {/* 진단 */}
//       <Route path="/diagnosis" element={<DiagnosisHome />} />
//       <Route path="/diagnosisinterview" element={<DiagnosisInterview />} />
//       {/* 간편 로그인 */}
//       <Route path="/easylogin" element={<EasyLogin />} />
//       {/* 브랜드 컨설팅 메인 */}
//       <Route path="/brandconsulting" element={<BrandConsulting />} />

//       {/* ✅ 기존 너가 쓰던 인터뷰 경로들 (유지) */}
//       <Route path="/logoconsulting" element={<LogoConsultingInterview />} />
//       <Route
//         path="/homepageconsulting"
//         element={<HomepageConsultingInterview />}
//       />
//       {/* ✅ (추천) 헷갈림 방지: naming 풀네임 alias도 같이 지원 */}
//       <Route path="/namingconsulting" element={<NamingConsultingInterview />} />
//       <Route
//         path="/brand/naming/interview"
//         element={<NamingConsultingInterview />}
//       />
//       <Route
//         path="/brand/logo/interview"
//         element={<LogoConsultingInterview />}
//       />
//       <Route
//         path="/brand/homepage/interview"
//         element={<HomepageConsultingInterview />}
//       />
//       {/* 없는 경로는 메인으로 */}
//       <Route path="*" element={<Navigate to="/main" replace />} />
//     </Routes>
//   );
// }

// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import FindID from "./pages/FindID.jsx";
import FindPassword from "./pages/FindPassword.jsx";

import MainPage from "./pages/MainPage.jsx";

import DiagnosisHome from "./pages/DiagnosisHome.jsx";
import DiagnosisInterview from "./pages/DiagnosisInterview.jsx";

import EasyLogin from "./pages/EasyLogin.jsx";

import BrandConsulting from "./pages/BrandConsulting.jsx";

import NamingConsultingInterview from "./pages/NamingConsultingInterview.jsx";
import LogoConsultingInterview from "./pages/LogoConsultingInterview.jsx";
import HomepageConsultingInterview from "./pages/HomepageConsultingInterview.jsx";

import PromotionPage from "./pages/Promotion.jsx";
import MyPage from "./pages/MyPage.jsx";
import DigitalImageConsultingInterview from "./pages/DigitalImageConsultingInterview.jsx";
import OfflineImageConsultingInterview from "./pages/OfflineImageConsultingInterview.jsx";

import PromoVideoConsultingInterview from "./pages/PromoVideoConsultingInterview.jsx";

import DiagnosisResult from "./pages/DiagnosisResult.jsx";
import PromotionResult from "./pages/PromotionResult.jsx";

import BrandConsultingResult from "./pages/BrandConsultingResult.jsx";

import InvestmentBoard from "./pages/InvestmentBoard.jsx";

export default function App() {
  return (
    <Routes>
      {/* ✅ 기본 진입: 로그인 */}
      <Route path="/" element={<Login />} />

      {/* ✅ 로그인/계정 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/findid" element={<FindID />} />
      <Route path="/findpw" element={<FindPassword />} />
      <Route path="/easylogin" element={<EasyLogin />} />

      {/* ✅ 메인 */}
      <Route path="/main" element={<MainPage />} />

      {/* ✅ 기업 진단 */}
      <Route path="/diagnosis" element={<DiagnosisHome />} />
      <Route path="/diagnosisinterview" element={<DiagnosisInterview />} />

      {/* ✅ 브랜드 컨설팅 메인 */}
      <Route path="/brandconsulting" element={<BrandConsulting />} />

      {/* ✅ 브랜드 컨설팅 인터뷰 (너가 쓰던 경로들 유지) */}
      <Route path="/logoconsulting" element={<LogoConsultingInterview />} />
      <Route path="/nameconsulting" element={<NamingConsultingInterview />} />
      <Route
        path="/homepageconsulting"
        element={<HomepageConsultingInterview />}
      />

      {/* ✅ (선택) 별칭(alias)도 유지 */}
      <Route path="/namingconsulting" element={<NamingConsultingInterview />} />
      <Route
        path="/brand/naming/interview"
        element={<NamingConsultingInterview />}
      />
      <Route
        path="/brand/logo/interview"
        element={<LogoConsultingInterview />}
      />
      <Route
        path="/brand/homepage/interview"
        element={<HomepageConsultingInterview />}
      />

      {/* ✅ 홍보물 컨설팅 */}
      <Route path="/promotion" element={<PromotionPage />} />

      <Route path="/mypage" element={<MyPage />} />

      <Route
        path="/promotion/digital/interview"
        element={<DigitalImageConsultingInterview />}
      />
      <Route
        path="/promotion/offline/interview"
        element={<OfflineImageConsultingInterview />}
      />
      <Route
        path="/promotion/video/interview"
        element={<PromoVideoConsultingInterview />}
      />

      <Route path="/diagnosis/result" element={<DiagnosisResult />} />
      <Route path="/promotion/result" element={<PromotionResult />} />

      <Route path="/brand/result" element={<BrandConsultingResult />} />

      <Route path="/investment" element={<InvestmentBoard />} />

      {/* ✅ 없는 경로는 메인으로 */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}
