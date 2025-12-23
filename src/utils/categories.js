// 카테고리 데이터
export const categories = [
  {
    id: 1,
    name: '컴퓨터/노트북',
    subCategories: [
      { id: 11, name: '노트북' },
      { id: 12, name: '데스크톱' },
      { id: 13, name: '워크스테이션' },
      { id: 14, name: '서버' }
    ]
  },
  {
    id: 2,
    name: '모니터/디스플레이',
    subCategories: [
      { id: 21, name: '모니터' },
      { id: 22, name: '프로젝터' },
      { id: 23, name: '터치스크린' },
      { id: 24, name: '액세서리' }
    ]
  },
  {
    id: 3,
    name: '주변기기',
    subCategories: [
      { id: 31, name: '키보드/마우스' },
      { id: 32, name: '웹캠' },
      { id: 33, name: '스피커/헤드셋' },
      { id: 34, name: 'USB/케이블' }
    ]
  },
  {
    id: 4,
    name: '네트워크/보안',
    subCategories: [
      { id: 41, name: '라우터/스위치' },
      { id: 42, name: '방화벽' },
      { id: 43, name: 'VPN 장비' },
      { id: 44, name: '네트워크 케이블' }
    ]
  },
  {
    id: 5,
    name: '스토리지',
    subCategories: [
      { id: 51, name: '외장 하드디스크' },
      { id: 52, name: 'SSD' },
      { id: 53, name: 'NAS' },
      { id: 54, name: '클라우드 스토리지' }
    ]
  },
  {
    id: 6,
    name: '사무용품',
    subCategories: [
      { id: 61, name: '의자' },
      { id: 62, name: '책상' },
      { id: 63, name: '조명' },
      { id: 64, name: '파일/바인더' }
    ]
  },
  {
    id: 7,
    name: '회의실 장비',
    subCategories: [
      { id: 71, name: '화상회의 시스템' },
      { id: 72, name: '화이트보드' },
      { id: 73, name: '마이크/스피커' },
      { id: 74, name: '회의 테이블' }
    ]
  },
  {
    id: 8,
    name: '소프트웨어',
    subCategories: [
      { id: 81, name: '오피스 소프트웨어' },
      { id: 82, name: '보안 소프트웨어' },
      { id: 83, name: '클라우드 서비스' },
      { id: 84, name: '개발 도구' }
    ]
  },
  {
    id: 9,
    name: '프린터/복사기',
    subCategories: [
      { id: 91, name: '레이저 프린터' },
      { id: 92, name: '잉크젯 프린터' },
      { id: 93, name: '복합기' },
      { id: 94, name: '소모품' }
    ]
  },
  {
    id: 10,
    name: '기타',
    subCategories: [
      { id: 101, name: '케이스/백팩' },
      { id: 102, name: '충전기/어댑터' },
      { id: 103, name: '스탠드/거치대' },
      { id: 104, name: '기타 액세서리' }
    ]
  }
]

// 카테고리 ID로 카테고리 찾기
export function findCategoryById(categoryId) {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category
    }
    const subCategory = category.subCategories.find(sub => sub.id === categoryId)
    if (subCategory) {
      return { ...subCategory, parentId: category.id, parentName: category.name }
    }
  }
  return null
}

