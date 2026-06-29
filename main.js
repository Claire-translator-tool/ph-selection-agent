(function () {
  'use strict';

  const STORAGE_KEY = 'ph_selection_agent_cases_v1';

  const products = [
    { id: 'phc-t', model: 'PHC-11TD-11', shortName: 'AQ/AO 到调节阀安全栅', category: '安全栅', series: 'T系列', aliases: ['PHC-11TD-11', 'PHC-12TD-111', 'PHC-22TD-1111'], evidence: '依据：T系列 PHC-11TD-11 单页、说明书、防爆证、安全手册。', summary: 'PLC/DCS 的 AQ/AO 4-20mA 输出到气动薄膜调节阀、阀门定位器。' },
    { id: 'phc-c', model: 'PHC-11CD-11', shortName: '便宜 AQ/AO 到调节阀安全栅', category: '安全栅', series: 'C系列', aliases: ['PHC-11CD-11', 'PHC-12CD-111', 'PHC-22CD-1111'], evidence: '依据：C系列 PHC-11CD-11 单页、说明书、防爆证、CCC。', summary: '客户明确说便宜、经济型时，PLC/DCS 输出到调节阀用 C 系列。' },
    { id: 'phd-ai-t', model: 'PHD-11TD-21', shortName: 'AI/变送器输入安全栅', category: '安全栅', series: 'T系列', aliases: ['PHD-11TD-21', 'PHD-12TD-211', 'PHD-22TD-2121'], evidence: '依据：T系列 PHD-11TD-21 单页、说明书、防爆证，参数按手册复核。', summary: '现场压力、液位等变送器 4-20mA 回 PLC/DCS。' },
    { id: 'phd-ai-c', model: 'PHD-11CD-21', shortName: '便宜 4-20mA 输入安全栅', category: '安全栅', series: 'C系列', aliases: ['PHD-11CD-21', 'PHD-12CD-211', 'PHD-22CD-2121'], evidence: '依据：C系列 PHD-11CD-21 单页、CCC、防爆证。', summary: '客户明确说便宜、经济型时，现场变送器回 PLC 用 C 系列。' },
    { id: 'di-t', model: 'PHD-11TF-27', shortName: 'DI/开关量输入安全栅', category: '安全栅', series: 'T系列', aliases: ['PHD-11TF-27', 'PHD-12TF-277', 'PHD-22TF-2727'], evidence: '依据：T系列 PHD-11TF-27、PHD-12TF-277、PHD-22TF-2727 单页。', summary: '危险区接近开关、干接点、NAMUR 等 DI 信号进 PLC/DCS。' },
    { id: 'di-c', model: 'PHD-11CF-27', shortName: '便宜 DI/开关量安全栅', category: '安全栅', series: 'C系列', aliases: ['PHD-11CF-27', 'PHD-12CF-277', 'PHD-22CF-2727'], evidence: '依据：C系列 PHD-11CF-27、PHD-12CF-277、PHD-22CF-2727 单页。', summary: '客户明确说便宜、经济型时，DI 开关量安全栅用 C 系列。' },
    { id: 'rtd-t', model: 'PHD-11TZ-X1', shortName: 'PT100/热电阻安全栅', category: '安全栅', series: 'T系列', aliases: ['PHD-11TZ-X1', 'PHD-12TZ-X11', 'PHD-22TZ-X1X1'], evidence: '依据：T系列热电阻输入安全栅单页和温度量安全手册。', summary: '危险区 PT100、热电阻温度信号。' },
    { id: 'tc-t', model: 'PHD-11TT-X1', shortName: '热电偶安全栅', category: '安全栅', series: 'T系列', aliases: ['PHD-11TT-X1', 'PHD-12TT-X11', 'PHD-22TT-X1X1'], evidence: '依据：T系列热电偶输入安全栅单页和温度量安全手册。', summary: '危险区 K/E/J/T 等热电偶温度信号。' },
    { id: 'temp-c', model: 'PHD-11CZ / PHD-11CT', shortName: '便宜温度量安全栅', category: '安全栅', series: 'C系列', aliases: ['PHD-11CZ', 'PHD-11CT'], evidence: '依据：C系列温度量选型单页和安全手册。', summary: '客户明确说便宜、经济型时，PT100 或热电偶选 C 系列温度量。' },
    { id: 'spd-signal', model: 'PHL-S24-L2/L3', shortName: '4-20mA/DI 信号浪涌', category: '浪涌保护器', series: 'PHL-S', aliases: ['PHL-S24', 'PHL-S24-L2', 'PHL-S24-L3'], evidence: '依据：T、S系列电涌保护器样册；PHL-S 系列 SIL 证书。', summary: '4-20mA、AI、DI 等仪表信号线路浪涌保护；2线用 L2，3线用 L3。' },
    { id: 'spd-rs485', model: 'PHL-T24-L2/L3', shortName: 'RS485 通讯浪涌', category: '浪涌保护器', series: 'PHL-T', aliases: ['PHL-T24', 'PHL-T24-L2', 'PHL-T24-L3', 'PHL-T24-L4'], evidence: '依据：T、S系列电涌保护器样册；PHL-T 系列证书；TUV 功能安全报告。', summary: 'RS485、Modbus 等通讯总线浪涌保护。' },
    { id: 'spd-24v', model: 'PHL-TA-24', shortName: '24V DC 电源浪涌', category: '浪涌保护器', series: 'PHL-TA', aliases: ['PHL-TA-24'], evidence: '依据：T、S系列电涌保护器样册，电源类选型目录。', summary: '24V DC 仪表电源、PLC 电源、现场控制柜电源浪涌保护。' },
    { id: 'spd-220v', model: 'PHL-TA-20/385/2P', shortName: '220V AC 电源避雷', category: '避雷器', series: 'PHL-TA', aliases: ['PHL-TA-20/385/2P', 'PHL-TA-20/385/1P+N'], evidence: '依据：T、S系列电涌保护器样册，电源类选型目录。', summary: '220V AC 单相电源进线或控制柜电源避雷/浪涌保护。' },
    { id: 'relay', model: 'PH6101-3A1B', shortName: '急停/安全门安全继电器', category: '安全继电器', series: 'PH6101', aliases: ['PH6101-3A1B'], evidence: '依据：北京平和安全继电器选型样册 26.01a。', summary: '急停按钮、安全门控制开关等机械安全场景。' }
  ];

  const rules = [
    ['先看信号方向', 'PLC/DCS 的 AQ/AO 输出到调节阀、定位器，选 PHC 模拟量输出安全栅。'],
    ['变送器回 PLC', '现场变送器 4-20mA 回 PLC/DCS 的 AI，选 PHD 模拟量输入安全栅。'],
    ['默认系列', '安全栅默认按 T 系列；客户说便宜、经济、低价、预算低时选 C 系列。'],
    ['浪涌保护', '4-20mA/DI 信号浪涌选 PHL-S24；RS485 选 PHL-T24；24V/220V 电源选 PHL-TA。'],
    ['证书参数', '客户要 SIL/SLL、防爆、CCC 或具体参数时，再按单个说明书、证书、安全手册复核。']
  ];

  const seedCases = [{ id: 'seed-ao-valve', builtIn: true, requirement: 'PLC的AQ输出4-20mA信号给气动薄膜调节阀，中间加安全栅', modelId: 'phc-t', reason: 'PLC AQ/AO 是输出到调节阀，属于模拟量输出安全栅，选 PHC，不选 PHD。' }];

  function norm(v) { return String(v || '').toLowerCase().replaceAll(' ', '').replaceAll('　', '').replaceAll('，', ','); }
  function html(v) { return String(v || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
  function has(t, words) { return words.some((w) => t.includes(w)); }
  function byId(id) { return products.find((p) => p.id === id) || null; }

  function directProduct(text) {
    const upper = String(text || '').toUpperCase();
    return products.find((p) => p.aliases.some((a) => upper.includes(a.toUpperCase()))) || null;
  }

  function detect(text) {
    const t = norm(text);
    const f = new Set();
    if (has(t, ['便宜', '经济', '低价', '预算', '成本', 'c系列', 'c型'])) f.add('cheap');
    if (has(t, ['安全栅', '安栅', '隔离栅', '本安', '防爆'])) f.add('barrier');
    if (has(t, ['浪涌', '电涌', '防雷', '避雷', 'spd'])) f.add('surge');
    if (has(t, ['sil', 'sll', '功能安全'])) f.add('sil');
    if (has(t, ['4-20ma', '4~20ma', '4到20ma', '420ma', '4-20'])) f.add('analog');
    if (has(t, ['aq', 'ao', '模拟量输出', '模拟输出', '输出到', '输出给', '给阀', '到阀', 'plc输出', 'dcs输出'])) f.add('ao');
    if (has(t, ['调节阀', '定位器', '气动薄膜', '气动阀', '阀门'])) f.add('valve');
    if (has(t, ['ai', '模拟量输入', '模拟输入', '变送器', '压力', '液位', '回plc', '进plc', '到plc', '回dcs', '进dcs'])) f.add('ai');
    if (has(t, ['di', '开关量', '干接点', '接近开关', 'namur', 'npn', 'pnp'])) f.add('di');
    if (has(t, ['pt100', 'rtd', '热电阻', 'cu50'])) f.add('rtd');
    if (has(t, ['热电偶', 'k型', 'e型', 'j型', 't型', 's型'])) f.add('tc');
    if (has(t, ['rs485', '485', 'rs422', 'rs232', 'modbus', '通讯', '通信', '总线'])) f.add('rs485');
    if (has(t, ['24v', '24伏', 'dc24'])) f.add('24v');
    if (has(t, ['220v', '220伏', 'ac220', '380v', '380伏'])) f.add('220v');
    if (has(t, ['电源', '供电', '电压'])) f.add('power');
    if (has(t, ['急停', '安全门', '安全继电器', 'ple', 'cat4', 'cat.4'])) f.add('relay');
    return f;
  }

  function channel(text) {
    const t = norm(text).replaceAll('一', '1').replaceAll('二', '2').replaceAll('两', '2').replaceAll('进', '入');
    if (has(t, ['1入1出', '单入单出', '单通道'])) return { label: '一入一出', key: '1-1' };
    if (has(t, ['1入2出', '单入双出', '双输出'])) return { label: '一入两出', key: '1-2' };
    if (has(t, ['2入1出', '双入单出'])) return { label: '两入一出', key: '2-1' };
    if (has(t, ['2入2出', '双入双出', '双通道'])) return { label: '两入两出', key: '2-2' };
    return null;
  }

  function channelModel(id, ch) {
    if (!ch) return '';
    const maps = {
      'phc-t': { '1-1': 'PHC-11TD-11', '1-2': 'PHC-12TD-111', '2-2': 'PHC-22TD-1111' },
      'phc-c': { '1-1': 'PHC-11CD-11', '1-2': 'PHC-12CD-111', '2-2': 'PHC-22CD-1111' },
      'phd-ai-t': { '1-1': 'PHD-11TD-21', '1-2': 'PHD-12TD-211', '2-2': 'PHD-22TD-2121' },
      'phd-ai-c': { '1-1': 'PHD-11CD-21', '1-2': 'PHD-12CD-211', '2-2': 'PHD-22CD-2121' },
      'di-t': { '1-1': 'PHD-11TF-27', '1-2': 'PHD-12TF-277', '2-2': 'PHD-22TF-2727' },
      'di-c': { '1-1': 'PHD-11CF-27', '1-2': 'PHD-12CF-277', '2-2': 'PHD-22CF-2727' },
      'rtd-t': { '1-1': 'PHD-11TZ-X1', '1-2': 'PHD-12TZ-X11', '2-2': 'PHD-22TZ-X1X1' },
      'tc-t': { '1-1': 'PHD-11TT-X1', '1-2': 'PHD-12TT-X11', '2-2': 'PHD-22TT-X1X1' }
    };
    return maps[id] && maps[id][ch.key] ? maps[id][ch.key] : '';
  }

  function getCases() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').filter((x) => x.requirement && x.modelId); } catch { return []; } }
  function saveCases(cases) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); }

  function overlap(a, b) {
    const fa = detect(a); const fb = detect(b);
    let n = 0; fa.forEach((x) => { if (fb.has(x)) n += 1; });
    return n;
  }

  function bestCase(text) {
    let best = null;
    getCases().concat(seedCases).forEach((c) => {
      const p = byId(c.modelId); if (!p) return;
      const score = norm(text).includes(norm(c.requirement)) || norm(c.requirement).includes(norm(text)) ? 99 : overlap(text, c.requirement);
      if (!best || score > best.score) best = { c, p, score };
    });
    return best && best.score >= 2 ? best : null;
  }

  function baseResult(productId, confidence, reason, rows, questions) {
    return { product: byId(productId), confidence, reason, rows, questions: questions || [], mode: '规则判断' };
  }

  function recommend(text) {
    const original = String(text || '').trim();
    if (!original) return { product: null, mode: '需要补充', confidence: 20, reason: '先把客户原话粘进来，我再给你选。', rows: [], questions: ['客户要什么信号', '是安全栅还是浪涌保护器'] };
    const direct = directProduct(original);
    if (direct) return { product: direct, mode: '型号识别', confidence: 90, reason: '客户原话里已经出现这个型号，我先展示对应资料和复核问题。', rows: [['客户说', direct.model, '识别为已有型号'], ['产品类', direct.category, direct.shortName]], questions: ['是否还要求 SIL/SLL', '是否还要求防爆/CCC', '参数是否要按证书复核'] };
    const learned = bestCase(original);
    if (learned) return { product: learned.p, mode: learned.c.builtIn ? '内置案例命中' : '训练案例命中', confidence: Math.min(96, 75 + learned.score * 6), reason: learned.c.reason, rows: [['已学案例', learned.c.requirement, learned.p.model], ['结果', learned.p.shortName, learned.p.model]], questions: ['是否要按证书/说明书复核'] };

    const f = detect(original);
    const cheap = f.has('cheap');
    let r;
    if (f.has('relay')) r = baseResult('relay', 84, '客户说的是急停、安全门或安全继电器，先选 PH6101-3A1B。', [['客户说', '急停/安全门', '选 PH6101-3A1B'], ['产品类', '安全继电器', '不是安全栅']], ['复位方式是什么', '输出触点数量够不够']);
    else if (f.has('surge')) {
      if (f.has('220v')) r = baseResult('spd-220v', 86, '客户说 220V 电源避雷/浪涌，先选 PHL-TA-20/385/2P。', [['客户说', '220V 电源避雷', '选 PHL-TA-20/385/2P'], ['再确认', 'TN/TT/IT', '必要时换 1P+N']], ['配电系统是什么', '是否需要遥信']);
      else if (f.has('24v') && f.has('power')) r = baseResult('spd-24v', 86, '客户说 24V 电源浪涌，先选 PHL-TA-24。', [['客户说', '24V 电源浪涌', '选 PHL-TA-24'], ['产品类', '直流电源 SPD', '不是信号 SPD']], ['安装在电源进线还是设备端', '接地条件是什么']);
      else if (f.has('rs485')) r = baseResult('spd-rs485', 88, '客户说 RS485/通讯信号浪涌，先选 PHL-T24-L2/L3。', [['客户说', 'RS485 通讯', '选 PHL-T24-L2/L3'], ['再确认', '2线/3线/4线', '决定 L2/L3/L4']], ['通讯是几线制', '通讯速率是多少']);
      else r = baseResult('spd-signal', 84, '客户说 4-20mA、DI 或仪表信号浪涌，先选 PHL-S24-L2/L3。', [['客户说', '信号浪涌', '选 PHL-S24-L2/L3'], ['再确认', '2线/3线/是否本安', '决定 L2/L3/EX']], ['信号是 2线还是 3线', '是否本安回路']);
    } else if (f.has('barrier') || f.has('analog') || f.has('ao') || f.has('ai') || f.has('di') || f.has('rtd') || f.has('tc')) {
      if (f.has('ao') || f.has('valve')) r = baseResult(cheap ? 'phc-c' : 'phc-t', 92, cheap ? 'PLC/DCS AQ/AO 输出到调节阀，客户要便宜，选 C 系列 PHC-11CD-11。' : 'PLC/DCS AQ/AO 输出到调节阀，默认主推 T 系列 PHC-11TD-11。', [['客户说', 'PLC/DCS AQ/AO 输出', cheap ? '选 PHC-11CD-11' : '选 PHC-11TD-11'], ['信号方向', '去调节阀/定位器', '属于模拟量输出安全栅']], ['是否需要 HART', '是否要求 SIL/SLL']);
      else if (f.has('rtd')) r = baseResult(cheap ? 'temp-c' : 'rtd-t', 84, cheap ? '客户说 PT100/热电阻且要便宜，先选 C 系列 PHD-11CZ。' : '客户说 PT100/热电阻，默认先选 T 系列 PHD-11TZ-X1。', [['客户说', 'PT100/热电阻', cheap ? '选 PHD-11CZ' : '选 PHD-11TZ-X1']], ['二线/三线/四线', '温度量程是多少']);
      else if (f.has('tc')) r = baseResult(cheap ? 'temp-c' : 'tc-t', 84, cheap ? '客户说热电偶且要便宜，先选 C 系列 PHD-11CT。' : '客户说热电偶，默认先选 T 系列 PHD-11TT-X1。', [['客户说', '热电偶', cheap ? '选 PHD-11CT' : '选 PHD-11TT-X1']], ['分度号是什么', '温度量程是多少']);
      else if (f.has('di')) r = baseResult(cheap ? 'di-c' : 'di-t', 84, cheap ? '客户说 DI/开关量安全栅且要便宜，先选 C 系列 PHD-11CF-27。' : '客户说 DI/开关量安全栅，默认先选 T 系列 PHD-11TF-27。', [['客户说', 'DI/开关量', cheap ? '选 PHD-11CF-27' : '选 PHD-11TF-27']], ['DI 是干接点、NAMUR 还是 NPN/PNP', '需要几个通道']);
      else r = baseResult(cheap ? 'phd-ai-c' : 'phd-ai-t', 76, cheap ? '客户只说 4-20mA/模拟量安全栅且要便宜，先按 C 系列输入型 PHD-11CD-21；如果是 PLC 输出到阀门，要改 PHC。' : '客户只说 4-20mA/模拟量安全栅但没说方向，先按常见变送器回 PLC 的输入型 PHD-11TD-21；如果是 PLC 输出到阀门，要改 PHC。', [['客户说', '4-20mA 安全栅', cheap ? '先选 PHD-11CD-21' : '先选 PHD-11TD-21'], ['必须确认', '变送器回 PLC 还是 PLC 输出到阀', '输出到阀要改 PHC']], ['这路 4-20mA 是输出到阀，还是变送器回 PLC']);
    } else {
      r = { product: null, mode: '需要补充', confidence: 28, reason: '这句话里缺少关键信息，我暂时不能负责任地直接给型号。', rows: [['还缺', '产品类型和信号', '例如安全栅/浪涌 + 4-20mA/DI/RS485/电源']], questions: ['是安全栅还是浪涌保护器', '信号类型是什么', '是否要便宜/C系列', '是否要求 SIL/SLL 或防爆'] };
    }

    const ch = channel(original);
    if (r.product && ch) {
      const model = channelModel(r.product.id, ch);
      r.channelHint = model ? `${ch.label}按 ${model} 复核完整资料。` : `${ch.label}已记录，需按具体系列资料复核完整型号。`;
      r.displayModel = model || r.product.model;
      r.rows = r.rows.concat([['客户说', ch.label, model ? `按 ${model} 复核` : '按通道配置复核']]);
    }
    return r;
  }

  function renderRows(rows) {
    if (!rows || !rows.length) return '';
    return `<section class="grid-section"><h3>一一对应</h3>${rows.map((x) => `<div class="mapping-row"><span>${html(x[0])}</span><strong>${html(x[1])}</strong><em>${html(x[2])}</em></div>`).join('')}</section>`;
  }

  function renderQuestions(items) {
    if (!items || !items.length) return '';
    return `<section class="grid-section"><h3>还要问客户</h3><div class="chips">${items.map((x) => `<span>${html(x)}</span>`).join('')}</div></section>`;
  }

  function renderAnswer(panel, data) {
    if (!data.product) {
      panel.innerHTML = `<div class="answer"><div class="answer-main"><span class="badge">${html(data.mode)}</span><h3 class="answer-title">还不能直接定型号</h3><p class="answer-subtitle">${html(data.reason)}</p></div>${renderRows(data.rows)}${renderQuestions(data.questions)}</div>`;
      return;
    }
    const p = data.product;
    panel.innerHTML = `<div class="answer"><div class="answer-main"><span class="badge">${html(data.mode)}</span><h3 class="answer-title">${html(data.displayModel || p.model)}</h3><p class="answer-subtitle">${html(p.shortName)}</p><p class="answer-subtitle">${html(data.reason)}</p>${data.channelHint ? `<p class="answer-subtitle">${html(data.channelHint)}</p>` : ''}</div><section class="grid-section"><h3>把握度 ${html(data.confidence)}%</h3><p class="source-note">${html(p.summary)}</p></section>${renderRows(data.rows)}${renderQuestions(data.questions)}<section class="grid-section"><h3>资料依据</h3><p class="source-note">${html(p.evidence)}</p></section></div>`;
  }

  function toast(msg) {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function refresh() {
    const userCases = getCases();
    document.getElementById('stats').innerHTML = [['内置案例', seedCases.length], ['你教过', userCases.length], ['产品入口', products.length], ['规则', rules.length]].map((x) => `<div class="stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
    document.getElementById('rules-list').innerHTML = rules.map((x) => `<div class="rule"><strong>${html(x[0])}</strong><span>${html(x[1])}</span></div>`).join('');
    document.getElementById('cases-list').innerHTML = seedCases.concat(userCases).map((c) => {
      const p = byId(c.modelId); const del = c.builtIn ? '' : `<button class="btn ghost" data-delete="${html(c.id)}">删除</button>`;
      return `<div class="case"><strong>${html(p ? p.model : c.modelId)}</strong><span>${html(c.requirement)}</span><span>${html(c.reason)}</span>${del}</div>`;
    }).join('');
  }

  function init() {
    const q = document.getElementById('need-input');
    const panel = document.getElementById('result-panel');
    const trainText = document.getElementById('train-text');
    const trainModel = document.getElementById('train-model');
    const trainReason = document.getElementById('train-reason');
    const memoryBox = document.getElementById('memory-box');

    trainModel.innerHTML = products.map((p) => `<option value="${p.id}">${html(p.model)} - ${html(p.shortName)}</option>`).join('');
    refresh();

    function run() {
      const data = recommend(q.value);
      renderAnswer(panel, data);
      if (q.value.trim()) trainText.value = q.value.trim();
      if (data.product) trainModel.value = data.product.id;
    }

    document.getElementById('run-btn').addEventListener('click', run);
    document.getElementById('clear-btn').addEventListener('click', () => {
      q.value = ''; trainText.value = ''; trainReason.value = '';
      panel.innerHTML = '<div class="empty"><strong>等你输入客户需求</strong><p>我会按 T 系列优先、便宜选 C 系列的规则推荐型号。</p></div>';
      q.focus();
    });
    document.querySelectorAll('[data-example]').forEach((btn) => btn.addEventListener('click', () => { q.value = btn.dataset.example; run(); }));
    document.querySelectorAll('[data-channel]').forEach((btn) => btn.addEventListener('click', () => { q.value = q.value.trim() ? `${q.value.trim()}，${btn.dataset.channel}` : btn.dataset.channel; run(); }));
    document.getElementById('fill-train').addEventListener('click', () => { trainText.value = q.value.trim(); toast('已填入当前问题'); });
    document.getElementById('save-train').addEventListener('click', () => {
      if (!trainText.value.trim()) return toast('先填客户原话');
      if (!trainReason.value.trim()) return toast('写一句为什么');
      const cases = getCases();
      cases.push({ id: `case-${Date.now()}`, builtIn: false, requirement: trainText.value.trim(), modelId: trainModel.value, reason: trainReason.value.trim() });
      saveCases(cases); refresh(); run(); toast('已保存训练');
    });
    document.getElementById('cases-list').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-delete]'); if (!btn) return;
      saveCases(getCases().filter((x) => x.id !== btn.dataset.delete)); refresh(); toast('已删除训练');
    });
    document.getElementById('export-memory').addEventListener('click', () => { memoryBox.value = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), cases: getCases() }, null, 2); toast('训练包已生成'); });
    document.getElementById('import-memory').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(memoryBox.value); const incoming = Array.isArray(parsed) ? parsed : parsed.cases;
        if (!Array.isArray(incoming)) throw new Error('bad');
        saveCases(getCases().concat(incoming.filter((x) => x.requirement && x.modelId))); refresh(); toast('已导入训练包');
      } catch { toast('训练包格式不对'); }
    });
    q.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') run(); });
  }

  window.phSelectionAgent = { products, recommend, detect, getCases, saveCases };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();