import Journey from '@/components/journey/Journey';

// 정적 페이지로 만든다(GitHub Pages에서도 동작). 실제 단계는 주소의 ?step= 값을 브라우저에서 읽는다.
// 다른 단계 주소로 바로 들어오면, 자바스크립트가 준비될 때까지 정적 HTML의 첫 단계 화면을 감춰 둔다.
const HIDE_UNTIL_READY = `(function(){try{var s=new URLSearchParams(location.search).get('step');if(s&&s!=='intro')document.documentElement.setAttribute('data-deeplink','1')}catch(e){}})();`;

export default function JourneyPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: HIDE_UNTIL_READY }} />
      <Journey initialStep="intro" />
    </>
  );
}
