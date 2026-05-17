// generate-code.js
// 사용법: node generate-code.js [개수] [만료일수]
// 예시:   node generate-code.js 5 7   ← 5개, 7일 유효
//
// 실행 전: npm install firebase-admin

const admin = require('firebase-admin');

// 🔧 Firebase Admin SDK 서비스 계정 키 파일 경로
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 인증코드 생성 (영문 대문자 + 숫자 8자리)
function generateCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 헷갈리는 문자 제외 (I,O,0,1)
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // 가독성을 위해 4자리씩 구분 (8자리일 때)
  if (length === 8) return code.slice(0,4) + '-' + code.slice(4);
  return code;
}

async function main() {
  const count     = parseInt(process.argv[2]) || 1;
  const expireDays = parseInt(process.argv[3]) || 14; // 기본 14일

  console.log(`\n코드 ${count}개 생성 (유효기간: ${expireDays}일)\n`);
  console.log('─'.repeat(40));

  const batch = db.batch();
  const codes = [];

  for (let i = 0; i < count; i++) {
    let code;
    // 중복 방지
    do { code = generateCode(); } while (codes.includes(code));
    codes.push(code);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expireDays);

    const ref = db.collection('inviteCodes').doc();
    batch.set(ref, {
      code,
      used: false,
      createdAt: admin.firestore.Timestamp.now(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      usedBy: null,
      usedAt: null
    });

    console.log(`  ${code}   (만료: ${expiresAt.toLocaleDateString('ko-KR')})`);
  }

  await batch.commit();
  console.log('─'.repeat(40));
  console.log(`✓ Firestore에 저장 완료\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
