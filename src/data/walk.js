// 이야기 산책 코스용 현장 정보: 머무는 시간(분), 현장에서 볼 것, 팁, 비 오는 날 괜찮은지, 아이와 가기 좋은지.
// visit: true 는 전시·기념관처럼 운영 시간·휴관일이 있는 곳이라 화면에서 '방문 전 확인' 안내를 붙여요.
// 시간과 팁은 일반적인 방문 기준의 대략값이에요. 운영 시간·예약 여부는 방문 전에 확인하세요.
export const WALK = {
  seolmundae: { stay: 120, rain: false, kids: false, look: '백록담 분화구와 구름이 걸린 능선', tip: '정상 탐방은 예약제로 운영되고 코스가 길어요. 출발 전에 탐방 예약 여부를 확인하세요.' },
  obaek: { stay: 90, rain: false, kids: false, look: '병풍처럼 늘어선 영실의 기암', tip: '날씨에 따라 입산이 통제될 수 있어요. 출발 전에 한라산 탐방 안내를 확인하세요.' },
  mulchang: { stay: 90, rain: false, kids: false, look: '오름 정상에 둥글게 고인 못', tip: '안개가 잦고 길이 거칠어요. 탐방 가능 여부를 먼저 확인하세요.' },
  sanbang: { stay: 50, rain: false, kids: true, look: '바다 앞에 우뚝 솟은 종 모양 봉우리', tip: '맑은 날 해안도로에서 올려다보면 모양이 잘 보여요.' },
  seongsan: { stay: 70, rain: false, kids: true, look: '분화구 능선 너머로 보이는 우도', tip: '해돋이 시간은 붐비니 이른 아침이나 늦은 오후도 좋아요.' },
  samsung: { stay: 40, visit: true, rain: false, kids: true, look: '세 개의 구멍이 있는 모흥혈', tip: '시내에 있어서 목관아·관덕정 같은 시내 장소와 묶기 좋아요.' },
  yeongdeung: { stay: 30, rain: false, kids: false, look: '바닷가에 남은 영등 신앙의 터', tip: '영등굿은 음력 2월 무렵이라고 알려져 있어요. 시기에 맞추면 더 좋아요.' },
  yongduam: { stay: 30, rain: false, kids: true, look: '바다 위로 머리를 든 용 모양 바위', tip: '공항에서 가까워 첫날이나 마지막 날 짧게 들르기 좋아요.' },
  stonepark: { stay: 120, visit: true, rain: true, kids: true, look: '돌문화 전시관과 설문대할망 이야기 공간', tip: '야외 공원이 넓어요. 비 오는 날엔 전시관 위주로 보세요.' },
  'gwandeok-harbang': { stay: 30, rain: false, kids: true, look: '관덕정 일대의 돌하르방', tip: '제주목 관아와 가까워 함께 보면 좋아요.' },
  'bukchon-bangsatap': { stay: 25, rain: false, kids: false, look: '마을 어귀에 쌓은 방사탑', tip: '4·3의 기억이 남은 마을이에요. 조용히 둘러봐 주세요.' },
  balddam: { stay: 30, rain: false, kids: true, look: '검은 돌담이 구불구불 이어진 밭', tip: '해 질 녘에 담 그림자가 길어져 사진이 잘 나와요.' },
  seongeup: { stay: 70, rain: false, kids: true, look: '정낭이 걸린 초가 마을', tip: '정낭을 걸어 집주인의 부재를 알리던 방식을 찾아보세요.' },
  budeok: { stay: 25, rain: false, kids: false, look: '바닷가에 둥글게 쌓은 돌 불턱', tip: '썰물 때 모양이 뚜렷하게 보여요.' },
  mokgwana: { stay: 60, visit: true, rain: true, kids: true, look: '조선시대 제주 관아 건물과 마당', tip: '관덕정·삼성혈과 가까워 시내 코스로 묶기 좋아요.' },
  hangpaduri: { stay: 60, rain: false, kids: false, look: '토성 터와 항몽 유적', tip: '들판이 넓고 그늘이 적어요. 해 지기 전에 도착하세요.' },
  peacepark: { stay: 90, visit: true, rain: true, kids: false, look: '위령 공간과 기념관 전시', tip: '무겁고 중요한 역사 공간이에요. 시간을 넉넉히 두고 천천히 보세요.' },
  chusa: { stay: 45, visit: true, rain: true, kids: false, look: '유배 시절 거처를 복원한 집과 추사관', tip: '전시 공간이 있어 비 오는 날에도 일부는 볼 수 있어요.' },
  mandeok: { stay: 40, visit: true, rain: true, kids: true, look: '김만덕의 나눔 이야기 전시', tip: '제주시 도심이라 목관아 코스와 묶기 좋아요.' },
  alddreu: { stay: 45, rain: false, kids: false, look: '들판 속에 남은 콘크리트 격납고', tip: '그늘이 없어요. 햇빛이 센 날엔 모자를 챙기세요.' },
  cheonjeyeon: { stay: 40, rain: false, kids: true, look: '3단으로 떨어지는 폭포와 선녀 전설 조형물', tip: '입구에서 폭포까지 계단이 있어요.' },
  manjanggul: { stay: 60, visit: true, rain: true, kids: true, look: '굴 속에 솟은 용암석주와 용암이 흐른 흔적', tip: '굴 안이 서늘하니 겉옷을 챙기세요. 공개 구간은 일부예요.' },
  geomun: { stay: 120, rain: false, kids: false, look: '숲길과 분화구, 용암이 흐른 흔적', tip: '탐방이 예약제로 알려져 있으니 방문 전에 확인하세요.' },
  haenyeo: { stay: 60, visit: true, rain: true, kids: true, look: '물질 도구와 해녀의 삶을 담은 전시', tip: '하도리 불턱, 구좌 밭담과 한 동선으로 묶기 좋아요.' },
}

export const walkInfo = (id) => WALK[id] ?? { stay: 40, rain: false, kids: false, look: '', tip: '' }
