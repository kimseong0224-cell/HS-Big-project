export default function LoginApp() {
  return (
    <div className="login-page navy">
      <div className="login-shell split">
        <section className="login-hero navy-panel">
          <div className="hero-top">
            <span className="hero-title-line">여러분의 새로운 시작</span>
            <span className="hero-title-line">BrandPliot이 함께 합니다.</span>
          </div>
          <p className="hero-copy subtle">
            가장 완벽한 분석으로
            <br />
            귀하의 비즈니스 가치를
            <br />
            증명하세요.
          </p>
        </section>

        <section className="login-panel light-panel">
          <h2>LOGIN</h2>
          <form className="login-form">
            <div className="field">
              <label htmlFor="login-id">아이디 (E-mail 계정)</label>
              <input id="login-id" type="text" placeholder="이메일 아이디" />
            </div>
            <div className="field">
              <label htmlFor="login-password">비밀번호</label>
              <input
                id="login-password"
                type="password"
                placeholder="비밀번호 입력"
              />
            </div>
            <div className="login-links">
              <button type="button">아이디 찾기</button>
              <span className="dot" aria-hidden="true" />
              <button type="button">비밀번호 찾기</button>
            </div>
            <button type="submit" className="login-primary">
              로그인
            </button>
            <button type="button" className="login-easy">
              간편로그인
            </button>
            <div className="login-divider" />
            <div className="signup-row">
              <div className="signup-copy">
                회원가입하고 <strong>BrandPliot</strong>의
                <br></br>
                <strong>더 많은 인사이트</strong>를 얻어보세요!
              </div>
              <button type="button" className="signup-cta">
                회원가입
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
