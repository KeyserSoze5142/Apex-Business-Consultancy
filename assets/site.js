(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasPointer = window.matchMedia("(pointer: fine)").matches;
  var yr = document.getElementById("year");
  if(yr) yr.textContent = new Date().getFullYear();

  var navEl = document.getElementById("nav");
  function onScroll(){ navEl.classList.toggle("scrolled", window.scrollY > 16); }
  window.addEventListener("scroll", onScroll, { passive:true }); onScroll();

  var burger = document.getElementById("burger"), drawer = document.getElementById("drawer");
  function closeDrawer(){ drawer.classList.remove("open"); burger.classList.remove("open"); burger.setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
  if(burger && drawer){
    burger.addEventListener("click", function(){
      var open = drawer.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open?"true":"false");
      document.body.style.overflow = open?"hidden":"";
    });
    drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeDrawer); });
  }

  var spot = document.getElementById("spotlight");
  if(spot && hasPointer && !reduce){
    var tx=50,ty=12,cx=50,cy=12,raf;
    window.addEventListener("pointermove", function(e){
      tx=(e.clientX/window.innerWidth)*100; ty=(e.clientY/window.innerHeight)*100;
      if(!raf) raf=requestAnimationFrame(loop);
    });
    function loop(){
      cx+=(tx-cx)*0.12; cy+=(ty-cy)*0.12;
      spot.style.setProperty("--mx",cx+"%"); spot.style.setProperty("--my",cy+"%");
      if(Math.abs(tx-cx)>0.1||Math.abs(ty-cy)>0.1) raf=requestAnimationFrame(loop); else raf=null;
    }
  }

  var els = document.querySelectorAll(".reveal");
  if(reduce){ els.forEach(function(el){ el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold:0.12, rootMargin:"0px 0px -40px 0px" });
    els.forEach(function(el){ io.observe(el); });
  }

  document.querySelectorAll(".acc-head").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.closest(".acc-item"), body = item.querySelector(".acc-body"), open = item.classList.contains("open");
      item.parentElement.querySelectorAll(".acc-item.open").forEach(function(o){ o.classList.remove("open"); o.querySelector(".acc-body").style.maxHeight=null; });
      if(!open){ item.classList.add("open"); body.style.maxHeight = body.scrollHeight+"px"; }
    });
  });
  var firstAcc = document.querySelector(".acc-item.open .acc-body");
  if(firstAcc) window.addEventListener("load", function(){ firstAcc.style.maxHeight = firstAcc.scrollHeight+"px"; });

  document.querySelectorAll("#chips .chip").forEach(function(chip){ chip.addEventListener("click", function(){ chip.classList.toggle("sel"); }); });

  // Web3Forms endpoint. Get your free access key at https://web3forms.com
  // (enter cwebber@apexbusinessconsultancy.com) and paste it below in place of
  // b802e001-4684-469d-8e69-f145a3219c9b
  var FORM_ENDPOINT = "https://api.web3forms.com/submit";
  var WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";
  var form = document.getElementById("inquiryForm");
  if(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();
      var honey = document.getElementById("honey");
      var ok = true;
      [["name", function(v){return v.trim().length>0;}],
       ["email", function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}],
       ["message", function(v){return v.trim().length>3;}]
      ].forEach(function(pair){
        var input = document.getElementById(pair[0]), field = input.closest(".field");
        if(!pair[1](input.value)){ field.classList.add("err"); ok=false; } else field.classList.remove("err");
      });
      if(!ok){ form.querySelector(".err input, .err textarea").focus(); return; }

      var btn = document.getElementById("submitBtn");
      btn.textContent = "Sending…"; btn.disabled = true;

      function showSuccess(){ document.getElementById("formCard").style.display="none"; document.getElementById("formSuccess").classList.add("show"); }

      if(honey && honey.value){ showSuccess(); return; }

      var chips = Array.prototype.map.call(document.querySelectorAll("#chips .chip.sel"), function(c){ return c.getAttribute("data-v"); });
      var val = function(id){ var el = document.getElementById(id); return el ? el.value : ""; };
      var payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "New inquiry — Apex Business Consultancy",
        from_name: "Apex Business Consultancy — Website",
        replyto: val("email"),
        name: val("name"), email: val("email"), phone: val("phone"), company: val("company"),
        website: val("website"), services: chips.join(", ") || "Not specified",
        message: val("message")
      };
      try{
        var res = await fetch(FORM_ENDPOINT, { method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" }, body: JSON.stringify(payload) });
        var data = await res.json().catch(function(){ return {}; });
        if(res.ok && data.success){ showSuccess(); } else { throw new Error("bad status"); }
      } catch(err){
        var body = encodeURIComponent("Name: "+payload.name+"\nEmail: "+payload.email+"\nPhone: "+payload.phone+"\nBusiness: "+payload.company+"\nWebsite: "+payload.website+"\nServices: "+payload.services+"\n\n"+payload.message);
        window.location.href = "mailto:cwebber@apexbusinessconsultancy.com?subject="+encodeURIComponent(payload.subject)+"&body="+body;
        showSuccess();
      }
    });
    form.querySelectorAll("input,textarea").forEach(function(el){ el.addEventListener("input", function(){ var f=el.closest(".field"); if(f) f.classList.remove("err"); }); });
  }
})();
