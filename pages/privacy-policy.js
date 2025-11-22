import React from "react";
import Head from "next/head";

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>개인정보 처리방침 - Yo! Travel</title>
      </Head>
      <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
          <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
            <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
              개인정보 처리방침
            </h1>
          </div>
        </section>
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full">
          <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
            <div className="prose prose-sm max-w-none">
              <p>최종 업데이트: 2025년 3월 9일</p>

              <h2>1. 소개</h2>
              <p>
                Yo! Travel에 오신 것을 환영합니다. 저희는 귀하의 개인정보를
                존중하고 보호하기 위해 최선을 다하고 있습니다. 본 개인정보
                처리방침은 귀하가 저희 웹사이트와 서비스를 이용할 때 귀하의
                정보가 어떻게 수집, 사용 및 보호되는지 설명합니다.
              </p>

              <h2>2. 수집하는 정보</h2>
              <p>저희는 다음과 같은 유형의 정보를 수집할 수 있습니다:</p>
              <ul>
                <li>
                  <strong>개인 정보:</strong> 계정이나 프로필을 생성할 때 이름,
                  이메일 주소, 프로필 사진 및 위치 데이터.
                </li>
                <li>
                  <strong>여행 정보:</strong> 귀하가 플랫폼에서 생성하거나
                  저장한 여행 코스, 일정 및 선호도.
                </li>
                <li>
                  <strong>사용 정보:</strong> 방문한 페이지, 좋아요한 게시물,
                  작성한 댓글 등 서비스와의 상호 작용 방식.
                </li>
                <li>
                  <strong>기기 정보:</strong> 귀하의 기기, 브라우저 및 IP 주소에
                  관한 정보.
                </li>
              </ul>

              <h2>3. 정보 사용 방법</h2>
              <p>저희는 귀하의 정보를 다음과 같은 목적으로 사용합니다:</p>
              <ul>
                <li>서비스 제공, 유지 및 개선</li>
                <li>계정 생성 및 유지</li>
                <li>다른 사용자에게 귀하의 여행 코스 및 콘텐츠 표시</li>
                <li>귀하의 콘텐츠와의 상호작용에 대한 알림 전송</li>
                <li>관련 콘텐츠 및 추천으로 경험 개인화</li>
                <li>플랫폼 개선을 위한 사용 패턴 분석</li>
              </ul>

              <h2>4. 데이터 저장 및 보안</h2>
              <p>
                귀하의 데이터는 안전한 데이터베이스 서비스인 Supabase를 사용하여
                저장됩니다. 저희는 귀하의 개인 정보를 무단 접근, 변경 또는
                공개로부터 보호하기 위해 적절한 보안 조치를 구현합니다.
              </p>

              <h2>5. 데이터 공유</h2>
              <p>저희는 귀하의 정보를 다음과 공유할 수 있습니다:</p>
              <ul>
                <li>
                  <strong>다른 사용자:</strong> 귀하의 개인정보 설정에 따라
                  프로필 정보, 여행 코스 및 댓글이 다른 사용자와 공유됩니다.
                </li>
                <li>
                  <strong>서비스 제공업체:</strong> 저희는 서비스 제공을 위해
                  Supabase 및 Kakao Maps와 같은 제3자 서비스를 사용합니다.
                </li>
                <li>
                  <strong>법적 요구사항:</strong> 법적 의무 준수 또는 권리
                  보호를 위해 정보를 공개할 수 있습니다.
                </li>
              </ul>

              <h2>6. 귀하의 권리</h2>
              <p>
                귀하의 위치에 따라 개인 데이터에 관한 다음과 같은 권리가 있을 수
                있습니다:
              </p>
              <ul>
                <li>귀하의 개인 데이터에 대한 접근</li>
                <li>부정확한 데이터 수정</li>
                <li>데이터 삭제</li>
                <li>처리 제한</li>
                <li>데이터 이동성</li>
              </ul>

              <h2>7. 쿠키 및 유사 기술</h2>
              <p>
                저희는 귀하의 경험을 향상시키고, 사용 패턴을 이해하며, 서비스를
                개선하기 위해 쿠키 및 유사 기술을 사용합니다.
              </p>

              <h2>8. 아동 개인정보</h2>
              <p>
                저희 서비스는 13세 미만의 아동을 대상으로 하지 않으며, 고의로
                13세 미만 아동의 개인정보를 수집하지 않습니다.
              </p>

              <h2>9. 개인정보 처리방침 변경</h2>
              <p>
                저희는 수시로 본 개인정보 처리방침을 업데이트할 수 있습니다.
                변경사항이 있을 경우 이 페이지에 새 정책을 게시하고 "최종
                업데이트" 날짜를 갱신하여 알려드립니다.
              </p>

              <h2>10. 문의하기</h2>
              <p>
                개인정보 처리방침에 대해 궁금한 점이 있으시면
                support@yotravel.com으로 문의해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;
