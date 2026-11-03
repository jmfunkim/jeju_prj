// 국가유산청 '국가유산 이미지검색' OpenAPI(키 없음)에서 장소 사진을 찾을 때 쓰는 설정.
// 장소마다 ① 국가유산 이름(name — 목록의 이름에 이 글자가 들어 있어야 함, exact 면 같아야 함)
//             ② 사진 설명에서 먼저 고를 말(prefer)을 적습니다. first: true 는 다른 출처보다 먼저 씁니다.
// 장소와 직접 관계 있는 국가유산만 적었습니다 (이름만 비슷한 다른 곳의 사진을 쓰지 않으려고).
export const KHS_PHOTO = {
  seongsan: { name: '성산일출봉 천연보호구역' },
  mulchang: { name: '제주 물장오리 오름', prefer: /오름|늪지/ },
  geomun: { name: '제주 선흘리 거문오름', prefer: /전경/ },
  manjanggul: { name: '제주 김녕굴과 만장굴', prefer: /^만장굴$|만장굴 내부/ },
  sanbang: { name: '제주 서귀포 산방산', prefer: /산방산/ },
  cheonjeyeon: { name: '제주 천제연 난대림' },
  mokgwana: { name: '제주목 관아', exact: true, prefer: /제주목 관아/ },
  samsung: { name: '제주 삼성혈', prefer: /삼성혈$/ },
  hangpaduri: { name: '제주 항파두리 항몽 유적', prefer: /토성|전경/ },
  seongeup: { name: '제주 성읍마을 객주집', prefer: /전경/ },
  chusa: { name: '추사적거지' },
  'gwandeok-harbang': { name: '돌하르방', exact: true, prefer: /관덕정/, first: true },
  alddreu: { name: '일제 지하벙커', prefer: /벙커/ },
  yongduam: { name: '용연·용두암', prefer: /^용두암$/ },
}
