(function () {
  "use strict";

  // 1. 配置你的默认角色库（想加谁就加谁）
  const DEFAULT_AVATARS = {
    "小舞": "https://img.nga.178.com/attachments/mon_202304/06/-9lddQ18i-55f7K1mT1kS8c-8c.jpg",
    "唐三": "", // 留空则自动走字模和哈希颜色
  };

  // 2. 核心算法：名字转哈希专属颜色
  function getNameColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return `hsl(${Math.abs(hash % 360)}, 65%, 60%)`;
  }

  // 3. 扫描并渲染消息气泡
  function renderBubbles() {
    document.querySelectorAll('.dl-bubble:not([data-my-done])').forEach(bubble => {
      bubble.setAttribute('data-my-done', '1');
      const name = bubble.getAttribute('data-name') || '';
      
      // 读取本地保存的自定义外观
      const customData = JSON.parse(localStorage.getItem('MY_CHAR_' + name) || '{}');
      const hashColor = getNameColor(name);
      const finalColor = customData.color || hashColor;

      // 绑定颜色（色条、气泡边框、字框边框）
      const nameEl = bubble.querySelector('.dl-name');
      const avatarBox = bubble.querySelector('.dl-avatar');
      if (nameEl) {
        nameEl.style.color = finalColor;
        nameEl.style.borderLeft = `3.5px solid ${finalColor}`;
      }
      bubble.style.borderColor = finalColor.replace('hsl', 'hsla').replace(')', ', 0.35)');
      if (avatarBox) {
        avatarBox.style.borderColor = finalColor;
        const finalAvatar = customData.avatar || DEFAULT_AVATARS[name];
        if (finalAvatar) {
          avatarBox.innerHTML = `<img src="${finalAvatar}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
        } else {
          avatarBox.innerText = name.charAt(0);
          avatarBox.style.color = finalColor;
        }
      }
    });
  }

  // 4. 点击外观弹出控制面板
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.dl-btn-look');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const bubble = btn.closest('.dl-bubble');
    const name = bubble.getAttribute('data-name');
    
    // 如果已经弹出了，再次点击就关闭
    let panel = bubble.nextElementSibling;
    if (panel && panel.classList.contains('my-custom-panel')) {
      panel.remove();
      return;
    }

    // 动态绘制外观设置卡
    panel = document.createElement('div');
    panel.className = 'my-custom-panel';
    panel.style.cssText = 'background:#181d26;border:1px solid #3d4a5d;border-radius:10px;padding:12px;margin:8px 0;display:flex;flex-direction:column;gap:10px;color:#fff;font-size:13px;position:relative;z-index:99;';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a3443;padding-bottom:6px;font-weight:bold;">
        <span>— ${name} 外观设置</span>
        <button type="button" class="close-p" style="background:none;border:none;color:#8a99ad;font-size:16px;cursor:pointer;">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span>专属颜色:</span>
        <input type="color" class="cp-val" style="border:none;background:none;width:32px;height:32px;cursor:pointer;">
      </div>
      <div>
        <div style="margin-bottom:4px;">头像图片直链:</div>
        <input type="text" class="url-val" placeholder="https://..." style="width:100%;padding:6px 8px;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#fff;font-size:12px;box-sizing:border-box;">
      </div>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button type="button" class="btn-save" style="flex:1;padding:6px;background:#238636;border:none;border-radius:6px;color:#fff;cursor:pointer;">保存</button>
        <button type="button" class="btn-reset" style="padding:6px 12px;background:#da3633;border:none;border-radius:6px;color:#fff;cursor:pointer;">恢复默认</button>
      </div>
    `;
    bubble.after(panel);

    const saved = JSON.parse(localStorage.getItem('MY_CHAR_' + name) || '{}');
    panel.querySelector('.url-val').value = saved.avatar || '';
    panel.querySelector('.close-p').onclick = () => panel.remove();
    panel.querySelector('.btn-save').onclick = () => {
      localStorage.setItem('MY_CHAR_' + name, JSON.stringify({
        color: panel.querySelector('.cp-val').value,
        avatar: panel.querySelector('.url-val').value
      }));
      location.reload();
    };
    panel.querySelector('.btn-reset').onclick = () => {
      localStorage.removeItem('MY_CHAR_' + name);
      location.reload();
    };
  });

  // 轮询监听聊天框变动
  setInterval(renderBubbles, 200);
  console.log("【我的正文助手】已就绪！");
})();
