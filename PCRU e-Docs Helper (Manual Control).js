// ==UserScript==
// @name         PCRU e-Docs Helper (Manual Control)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  เปิดทุก Tab และกดทราบ+บันทึก+ปิด | หากไม่พบปุ่มบันทึกจะให้กดเพื่อปิดเอง
// @author       Gemini
// @match        https://e-docs.pcru.ac.th/assign*
// @grant        GM_openInTab
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';

    // ฟังก์ชันสร้างปุ่มพื้นฐาน
    function createButton(text, color, top) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        Object.assign(btn.style, {
            position: 'fixed', top: top + 'px', right: '20px', zIndex: '10000',
            padding: '15px 25px', backgroundColor: color, color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
            fontSize: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.1s'
        });
        document.body.appendChild(btn);
        return btn;
    }

    // --- ส่วนที่ 1: หน้าดูเอกสาร (View) ---
    if (window.location.href.includes('/assign/view/')) {
        const saveBtn = document.querySelector('button#submit');
        const suggestBtn = document.querySelector('button[data-suggest="ทราบ"]');

        if (saveBtn && suggestBtn) {
            // กรณีปกติ: มีปุ่มให้กด
            const btnConfirm = createButton('✅ ทราบ + บันทึก + ปิด Tab', '#dc3545', 80);

            btnConfirm.onclick = function() {
                suggestBtn.click(); // เลือก "ทราบ"
                setTimeout(() => {
                    saveBtn.click(); // กดบันทึก
                    setTimeout(() => { window.close(); }, 1000); // ปิด Tab หลังผ่านไป 1 วิ
                }, 100);
            };
        } else {
            // กรณีไม่พบปุ่มบันทึก: สร้างปุ่มสีเทาให้กดปิดเอง
            const btnClose = createButton('⚠️ ไม่พบปุ่มบันทึก (คลิกเพื่อปิด)', '#6c757d', 80);
            btnClose.onclick = function() {
                window.close();
            };
        }
    }

    // --- ส่วนที่ 2: หน้าหลัก (List) ---
    else if (window.location.href.endsWith('/assign') || window.location.href.includes('/assign?')) {
        const btnOpenAll = createButton('🚀 เปิด NEW TAB ทั้งหมด', '#ffc107', 80);
        btnOpenAll.style.color = '#000'; // สีปุ่มหน้าหลักเป็นตัวหนังสือดำ

        btnOpenAll.onclick = function() {
            const links = document.querySelectorAll('a.btn-warning[href*="/assign/view/"]');
            if (links.length === 0) {
                alert('⚠️ ไม่พบรายการที่ต้องกดรับทราบ');
                return;
            }

            if (confirm(`พบ ${links.length} รายการ ต้องการเปิดทั้งหมดหรือไม่?`)) {
                links.forEach((link, index) => {
                    setTimeout(() => {
                        GM_openInTab(link.href, { active: false, insert: true, setParent: true });
                    }, index * 400);
                });
            }
        };
    }
})();