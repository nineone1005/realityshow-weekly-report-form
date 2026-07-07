const fs = require('fs');
const path = require('path');

/**
 * 将表单 JSON 数据转换为 Markdown 格式（可直接用于学城 createDocument --file）
 * 用法: node generate-km-doc.js <input.json> [output.md]
 */

function generateKmMarkdown(data) {
  const f = data.fields || {};
  const t = data.tables || {};

  let md = `# 周报-${f.projectName || '综艺项目'}${f.episode || ''}\n\n`;

  md += `##### **${f.episode || '本期'}节目核心结论：**\n\n`;
  if (f.coreConclusion) {
    const lines = f.coreConclusion.split('\n').filter(l => l.trim());
    lines.forEach((line, idx) => {
      md += `${idx + 1}. ${line.replace(/^\d+\.\s*/, '')}\n`;
    });
  }
  md += '\n';

  md += `##### 项目背景：\n\n${f.projectBackground || ''}\n\n`;

  md += `##### 播出进度：\n\n`;
  if (t.scheduleTable && t.scheduleTable.length > 0) {
    md += '| 期数 | 播出日期 | 播出状态 | 核心权益 |\n';
    md += '| --- | --- | --- | --- |\n';
    t.scheduleTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} |\n`;
    });
  }
  md += '\n';

  md += `##### **节目播出：**\n\n`;
  md += `1. 站内表现：${f.totalPlayCount ? '截至统计日期，首期累积播放量' + f.totalPlayCount : ''}。${f.heatPeak ? '站内热度峰值' + f.heatPeak : ''}。${f.platformRankings || ''}\n\n`;

  if (t.thirdPartyTable && t.thirdPartyTable.length > 0) {
    md += '2. 三方榜单：';
    t.thirdPartyTable.forEach((row, idx) => {
      if (idx > 0) md += '；';
      md += `${row[0] || ''}${row[1] ? ' ' + row[1] : ''}${row[2] ? '×' + row[2] : ''}`;
    });
    md += '\n\n';
  }

  md += `3. 社媒指数：${f.socialIndex || ''}\n\n`;

  md += `##### **节目传播：**\n\n`;
  md += `1. 热搜：${f.hotSearchTotal ? '首期节目共收获全网热搜' + f.hotSearchTotal : ''}。\n\n`;
  if (t.hotSearchTable && t.hotSearchTable.length > 0) {
    md += '| 传播平台 | 热搜总数 | 主榜上榜数 | 主榜TOP个数 | 文娱榜上榜数 | 高位热搜内容 |\n';
    md += '| --- | --- | --- | --- | --- | --- |\n';
    t.hotSearchTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} | ${row[4] || ''} | ${row[5] || ''} |\n`;
    });
    md += '\n';
  }

  md += `2. 短视频：${f.hitWorksDesc || ''}\n\n`;
  if (t.shortVideoTable && t.shortVideoTable.length > 0) {
    md += '| 平台 | 话题总播放量 | 新增播放量 | 发布数量 | 爆款数量 | 备注 |\n';
    md += '| --- | --- | --- | --- | --- | --- |\n';
    t.shortVideoTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} | ${row[4] || ''} | ${row[5] || ''} |\n`;
    });
    md += '\n';
  }

  md += `3. 媒体平台/制作方宣推资源\n\n`;
  if (t.mediaResourceTable && t.mediaResourceTable.length > 0) {
    md += '| 资源类型 | 资源点位 | 带品牌权益 | 备注 |\n';
    md += '| --- | --- | --- | --- |\n';
    t.mediaResourceTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} |\n`;
    });
    md += '\n';
  }

  md += `4. 爆款作品：${f.hitWorksDesc || ''}\n\n`;

  md += `##### **节目权益表现**\n\n`;
  md += `${f.rightsOverview || ''}\n\n`;
  if (t.rightsTable && t.rightsTable.length > 0) {
    md += '| 权益种类 | 权益类型 | 时长/次数 | 溢出 | 上刊物料 |\n';
    md += '| --- | --- | --- | --- | --- |\n';
    t.rightsTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} | ${row[4] || ''} |\n`;
    });
    md += '\n';
  }

  if (f.secondClientRights) {
    md += `二身份客户权益：${f.secondClientRights}\n\n`;
  }

  if (t.clientSecondsTable && t.clientSecondsTable.length > 0) {
    md += `所有客户权益秒数汇总\n\n`;
    md += '| 品牌 | 露出总时长（s） |\n';
    md += '| --- | --- |\n';
    t.clientSecondsTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} |\n`;
    });
    md += '\n';
  }

  md += `##### **节目硬广**\n\n`;
  md += `${f.adTypes || ''}，曝光总计${f.adTotalExposure || ''}，实时达成率${f.adAchievementRate || ''}，整体完成进度${f.adOverallProgress || ''}。\n\n`;
  if (t.adsTable && t.adsTable.length > 0) {
    md += '| 资源 | 端 | 曝光PV | 占比 | 点击率 | 备注 |\n';
    md += '| --- | --- | --- | --- | --- | --- |\n';
    t.adsTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} | ${row[4] || ''} | ${row[5] || ''} |\n`;
    });
    md += '\n';
  }

  md += `##### **品牌传播**\n\n`;
  md += `1. **商务传播**\n\n`;
  md += `**【微博平台】**${f.weiboSpread || ''}\n\n`;
  md += `**【小红书平台】**${f.xiaohongshuSpread || ''}\n\n`;
  md += `**【视频号平台】**${f.videoChannelSpread || ''}\n\n`;
  md += `**【腾讯视频】**${f.tencentComments || ''}\n\n`;
  md += `2. **内部宣推：**${f.internalPromotion || ''}\n\n`;

  md += `##### **站内承接**\n\n`;
  md += `${f.searchKeyword ? '主搜词"' + f.searchKeyword + '"' : ''}站内搜索QV总数${f.searchQVTotal || ''}，峰值日${f.searchQVPeak || ''}；搜索UV总数${f.searchUVTotal || ''}。\n\n`;
  if (t.siteTable && t.siteTable.length > 0) {
    md += '| 日期 | 搜索QV | 搜索UV | QV_CTR | UV_CTR | 意向UV | 意向率 | 支付订单量 | 支付UV | 搜索GTV | 搜索实付GTV |\n';
    md += '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
    t.siteTable.forEach(row => {
      md += `| ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''} | ${row[3] || ''} | ${row[4] || ''} | ${row[5] || ''} | ${row[6] || ''} | ${row[7] || ''} | ${row[8] || ''} | ${row[9] || ''} | ${row[10] || ''} |\n`;
    });
    md += '\n';
  }

  return md;
}

function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3] || 'km-weekly-report.md';

  if (!inputFile) {
    console.error('用法: node generate-km-doc.js <input.json> [output.md]');
    process.exit(1);
  }

  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`错误: 文件不存在 ${inputPath}`);
    process.exit(1);
  }

  const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const md = generateKmMarkdown(jsonData);

  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, md, 'utf-8');

  console.log(`✅ 学城 Markdown 已生成: ${outputPath}`);
  console.log(`\n下一步操作:`);
  console.log(`  oa-skills citadel createDocument --title "周报-${jsonData.fields?.projectName || '综艺项目'}${jsonData.fields?.episode || ''}" --file ${outputPath}`);
}

main();
