/**
 * 實拍獎品照（public/prizes/）在卡片上的對焦位置（CSS object-position）。
 *
 * 卡片用 object-cover 滿版填滿，高度會隨得獎人數改變（扁或高），
 * 因此每張照片指定裁切時要保留的重點區域，避免只剩下不具代表性的部分
 * （例如 Switch 只剩黑色螢幕）。沒有列出的圖片使用置中。
 */
export const PRIZE_IMAGE_FOCUS: Record<string, string> = {
  '/prizes/gold-20g.jpg': '50% 42%', // 金條本體
  '/prizes/iphone-18-pro.jpg': '35% 22%', // 背面三鏡頭
  '/prizes/ipad-pro-11.jpg': '50% 45%', // 機身與彩色邊框（原圖上方標語已裁掉）
  '/prizes/dyson-hp11.jpg': '50% 22%', // 上半部環形出風口
  '/prizes/dyson-v10.jpg': '50% 22%', // 機身與集塵筒
  '/prizes/switch-2.jpg': '12% 50%', // 左側 Joy-Con 搖桿
  '/prizes/garmin-forerunner-170.jpg': '45% 45%', // 錶面
  '/prizes/sony-wf-l910.jpg': '60% 65%', // 耳機與充電盒
  '/prizes/sodastream-terra.jpg': '50% 38%', // 機頭與品牌字樣
};

export function prizeImageFocus(src: string): string {
  return PRIZE_IMAGE_FOCUS[src] ?? '50% 50%';
}
