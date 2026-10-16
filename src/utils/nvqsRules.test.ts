import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roundQuanY,
  calculateBMI,
  validateBmiTT68,
  calculateTotalVision,
  validateVisionTT68,
  evaluateDepressionScore,
  evaluateManiaScore,
  evaluateSchizophreniaScore,
  checkResidenceDeadlines,
  auditQuotasTT68,
  isThanNhanHopPhapND218,
} from './nvqsRules.ts';

test('1. Military medical rounding (roundQuanY)', () => {
  // >= 0.50 -> 1 unit, <= 0.49 -> 0
  assert.equal(roundQuanY(162.5), 163);
  assert.equal(roundQuanY(162.49), 162);
  assert.equal(roundQuanY(50.5), 51);
  assert.equal(roundQuanY(50.49), 50);
  assert.equal(roundQuanY(80.5), 81);
  assert.equal(roundQuanY(80.4), 80);
});

test('2. BMI calculation & TT 68/2025 red alert', () => {
  // Height 170cm, Weight 65kg -> BMI = 65 / (1.7^2) = 22.5
  const bmi1 = calculateBMI(170, 65);
  assert.equal(bmi1, 22.5);
  const res1 = validateBmiTT68(170, 65);
  assert.equal(res1.isEligible, true);
  assert.equal(res1.warningMessage, undefined);

  // Severe underweight: 170cm, 50kg -> BMI = 50 / 2.89 = 17.3 (< 18.0)
  const resUnderweight = validateBmiTT68(170, 50);
  assert.equal(resUnderweight.isEligible, false);
  assert.ok(resUnderweight.warningMessage?.includes('Thông tư 68/2025/TT-BQP'));

  // Obese: 165cm, 85kg -> BMI = 85 / (1.65^2) = 31.2 (> 29.9)
  const resObese = validateBmiTT68(165, 85);
  assert.equal(resObese.isEligible, false);
  assert.ok(resObese.warningMessage?.includes('Chỉ số BMI < 18.0 hoặc > 29.9'));
});

test('3. Vision score & TT 68/2025 refraction guard', () => {
  // Normal vision
  assert.equal(calculateTotalVision(10, 10), 20);
  // Capped at 10 each
  assert.equal(calculateTotalVision(12, 10), 20);

  // Eligible vision
  const resVisionGood = validateVisionTT68({
    rightEyeWithoutGlasses: 10,
    leftEyeWithoutGlasses: 10,
    myopiaDiop: 1.25,
  });
  assert.equal(resVisionGood.isEligible, true);

  // Myopia > 1.5 Diop -> Ineligible
  const resMyopiaFail = validateVisionTT68({
    rightEyeWithoutGlasses: 7,
    leftEyeWithoutGlasses: 6,
    myopiaDiop: 1.75,
  });
  assert.equal(resMyopiaFail.isEligible, false);
  assert.ok(resMyopiaFail.warningMessage?.includes('> 1.5 diop'));

  // Hyperopia any degree -> Ineligible
  const resHyperopiaFail = validateVisionTT68({
    rightEyeWithoutGlasses: 8,
    leftEyeWithoutGlasses: 8,
    hyperopiaDiop: 0.5,
  });
  assert.equal(resHyperopiaFail.isEligible, false);
  assert.ok(resHyperopiaFail.warningMessage?.includes('viễn thị'));
});

test('4. Mental health screening questionnaire', () => {
  assert.equal(evaluateDepressionScore(2), 'BÌNH_THƯỜNG');
  assert.equal(evaluateDepressionScore(3), 'NGHI_NGỜ');
  assert.equal(evaluateDepressionScore(5), 'XÁC_ĐỊNH');

  assert.equal(evaluateManiaScore(1), 'BÌNH_THƯỜNG');
  assert.equal(evaluateManiaScore(4), 'NGHI_NGỜ');
  assert.equal(evaluateManiaScore(6), 'XÁC_ĐỊNH');

  assert.equal(evaluateSchizophreniaScore(0), 'BÌNH_THƯỜNG');
  assert.equal(evaluateSchizophreniaScore(1), 'XÁC_ĐỊNH');
});

test('5. Residence deadlines & ND 218 violations', () => {
  // Normal timely registration
  const res1 = checkResidenceDeadlines({
    tinhTrangCuTru: 'CO_MAT_TAI_DIA_PHUONG',
    daDangKyBienDong: true,
    soNgayLamViecChuaDangKy: 2,
  });
  assert.equal(res1.hasViolation, false);

  // Over 5 working days -> Warning
  const res2 = checkResidenceDeadlines({
    tinhTrangCuTru: 'CO_MAT_TAI_DIA_PHUONG',
    daDangKyBienDong: false,
    soNgayLamViecChuaDangKy: 7,
  });
  assert.equal(res2.hasViolation, true);
  assert.equal(res2.violationCode, 'ND218_D8_K2D');

  // Absent > 3 months unregistered
  const res3 = checkResidenceDeadlines({
    tinhTrangCuTru: 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY',
    daDangKyBienDong: false,
  });
  assert.equal(res3.hasViolation, true);
  assert.equal(res3.violationCode, 'ND218_D8_K2D_VANG');
});

test('6. Quota thresholds and ratio checks (TT 68/2025)', () => {
  // Normal quota: Target 20, calling 60 (300% <= 400%), reserve 1 (5% <= 5%)
  const auditNormal = auditQuotasTT68({
    soLuongGoiKham: 60,
    chiTieuPhuong: 20,
    soLuongDuPhong: 1,
    chiTieuGiaoQuan: 20,
  });
  assert.equal(auditNormal.vuotTyLeGoiKham, false);
  assert.equal(auditNormal.vuotTyLeDuPhong, false);

  // Exceeding 400%: Target 20, calling 90 (450% > 400%)
  const auditCallExceed = auditQuotasTT68({
    soLuongGoiKham: 90,
    chiTieuPhuong: 20,
    soLuongDuPhong: 1,
    chiTieuGiaoQuan: 20,
  });
  assert.equal(auditCallExceed.vuotTyLeGoiKham, true);
  assert.ok(auditCallExceed.canhBao?.[0].includes('vượt quá 04 lần (400%)'));

  // Exceeding 5% reserve: Target 20, reserve 2 (10% > 5%)
  const auditReserveExceed = auditQuotasTT68({
    soLuongGoiKham: 60,
    chiTieuPhuong: 20,
    soLuongDuPhong: 2,
    chiTieuGiaoQuan: 20,
  });
  assert.equal(auditReserveExceed.vuotTyLeDuPhong, true);
  assert.ok(auditReserveExceed.canhBao?.[0].includes('tỷ lệ khống chế tối đa 5%'));
});

test('7. Legal relative classification under Decree 218/2025', () => {
  assert.equal(isThanNhanHopPhapND218('CHA_DE'), true);
  assert.equal(isThanNhanHopPhapND218('ME_DE'), true);
  assert.equal(isThanNhanHopPhapND218('VO'), true);
  assert.equal(isThanNhanHopPhapND218('CON_DE'), true);
  assert.equal(isThanNhanHopPhapND218('ANH_RUOT'), false); // Anh ruột không thuộc nhóm lý do chính đáng quy định tại K1 Điều 3 NĐ 218
});
