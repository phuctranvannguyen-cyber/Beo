/* ==========================================================
   CHUYỆN CÁI HỘP CỦA BỤT
   SCRIPT.JS - VERSION 2.0
========================================================== */

"use strict";

/* ==========================================================
   DOM
========================================================== */

const scenes = [...document.querySelectorAll(".scene")];

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const loading = document.getElementById("loading");
const background = document.getElementById("background");
const light = document.getElementById("light");

const moneyContainer = document.getElementById("money-container");

const bgMusic = document.getElementById("bgMusic");
const magicSound = document.getElementById("magicSound");
const ghostSound = document.getElementById("ghostSound");

/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = {

    sceneDuration: 5000,

    loadingTime: 1500,

    fadeTime: 700,

    moneyAmount: 120

};

/* ==========================================================
   STATE
========================================================== */

const state = {

    currentScene:0,

    playing:false,

    timer:null,

    observer:null,

    moneyTimers:[]

};

/* ==========================================================
   SAFE FUNCTIONS
========================================================== */

function safePlay(audio){

    if(!audio) return;

    audio.currentTime=0;

    audio.play().catch(()=>{});

}

function safePause(audio){

    if(!audio) return;

    audio.pause();

    audio.currentTime=0;

}

function qs(selector){

    return document.querySelector(selector);

}

/* ==========================================================
   LOADING
========================================================== */

window.addEventListener("load",()=>{

    if(!loading){

        init();

        return;

    }

    setTimeout(()=>{

        loading.style.transition="1s";

        loading.style.opacity="0";

        setTimeout(()=>{

            loading.remove();

            init();

        },1000);

    },CONFIG.loadingTime);

});

/* ==========================================================
   INIT
========================================================== */

function init(){

    showScene(0);

    bindEvents();

}

/* ==========================================================
   EVENTS
========================================================== */

function bindEvents(){

    if(startBtn){

        startBtn.addEventListener("click",startStory);

    }

    if(restartBtn){

        restartBtn.addEventListener("click",restartStory);

    }

    document.addEventListener("keydown",(e)=>{

        if(e.code==="Space"){

            e.preventDefault();

            if(!state.playing){

                startStory();

            }

        }

    });

}

/* ==========================================================
   STORY
========================================================== */

function startStory(){

    if(state.playing) return;

    state.playing=true;

    state.currentScene=1;

    showScene(1);

    safePlay(bgMusic);

    runSceneEffects(1);

    state.timer=setInterval(()=>{

        nextScene();

    },CONFIG.sceneDuration);

}

/* ==========================================================
   NEXT SCENE
========================================================== */

function nextScene(){

    state.currentScene++;

    if(state.currentScene>=scenes.length){

        finishStory();

        return;

    }

    showScene(state.currentScene);

    runSceneEffects(state.currentScene);

}

/* ==========================================================
   SHOW SCENE
========================================================== */

function showScene(index){

    scenes.forEach(scene=>{

        scene.classList.remove("active");

    });

    if(scenes[index]){

        scenes[index].classList.add("active");

    }

}
/* ==========================================================
   SCENE EFFECTS
========================================================== */

function runSceneEffects(scene){

    switch(scene){

        case 1:

            changeBackground("#87ceeb");

            break;

        case 2:

            changeBackground("#b8e986");

            break;

        case 3:

            playGhostEffect();

            break;

        case 4:

            playMagicEffect();

            break;

        case 5:

            openGiftAnimation();

            break;

        case 6:

            startMoneyRain(60);

            break;

        case 7:

            startMoneyRain(120);

            break;

        case 8:

            startMoneyRain(180);

            changeBackground("#ffe082");

            break;

        case 9:

            finishStory();

            break;

    }

}

/* ==========================================================
   BACKGROUND
========================================================== */

function changeBackground(color){

    if(!background) return;

    background.style.transition="1s";

    background.style.background=
    `linear-gradient(
        180deg,
        ${color},
        #ffffff
    )`;

}

/* ==========================================================
   GHOST
========================================================== */

function playGhostEffect(){

    safePlay(ghostSound);

    const ghost=document.querySelector(".ghost");

    if(!ghost) return;

    ghost.animate(

        [

            {

                transform:"translateY(0px) scale(1)",

                opacity:0

            },

            {

                transform:"translateY(-20px) scale(1.1)",

                opacity:1

            },

            {

                transform:"translateY(0px) scale(1)",

                opacity:1

            }

        ],

        {

            duration:2500,

            easing:"ease-in-out"

        }

    );

}

/* ==========================================================
   MAGIC
========================================================== */

function playMagicEffect(){

    safePlay(magicSound);

    if(light){

        light.classList.add("active");

    }

    const buddha=document.querySelector(".buddha");

    if(buddha){

        buddha.animate(

            [

                {

                    transform:"scale(.4)",

                    opacity:0

                },

                {

                    transform:"scale(1.2)",

                    opacity:1

                },

                {

                    transform:"scale(1)",

                    opacity:1

                }

            ],

            {

                duration:1800,

                easing:"ease-out"

            }

        );

    }

    setTimeout(()=>{

        if(light){

            light.classList.remove("active");

        }

    },2500);

}

/* ==========================================================
   GIFT
========================================================== */

function openGiftAnimation(){

    const gift=document.querySelector(".gift");

    if(!gift) return;

    gift.animate(

        [

            {

                transform:"rotate(0deg) scale(1)"

            },

            {

                transform:"rotate(18deg) scale(1.2)"

            },

            {

                transform:"rotate(-18deg) scale(.9)"

            },

            {

                transform:"rotate(10deg) scale(1.15)"

            },

            {

                transform:"rotate(0deg) scale(1)"

            }

        ],

        {

            duration:1500,

            easing:"ease"

        }

    );

}
/* ==========================================================
   MONEY RAIN SYSTEM
========================================================== */

function startMoneyRain(amount = CONFIG.moneyAmount){

    stopMoneyRain();

    let created = 0;

    const timer = setInterval(()=>{

        createMoney();

        created++;

        if(created >= amount){

            clearInterval(timer);

        }

    },60);

    state.moneyTimers.push(timer);

}

function stopMoneyRain(){

    state.moneyTimers.forEach(timer=>clearInterval(timer));

    state.moneyTimers=[];

}

function createMoney(){

    if(!moneyContainer) return;

    const money=document.createElement("div");

    money.className="money";

    const icons=[

        "💵",

        "💰",

        "💎",

        "🪙"

    ];

    money.textContent=

        icons[Math.floor(Math.random()*icons.length)];

    money.style.left=Math.random()*100+"vw";

    money.style.top="-80px";

    money.style.fontSize=

        (24+Math.random()*30)+"px";

    money.style.animationDuration=

        (3+Math.random()*3)+"s";

    money.style.transform=

        `rotate(${Math.random()*360}deg)`;

    moneyContainer.appendChild(money);

    money.addEventListener("animationend",()=>{

        money.remove();

    });

}

/* ==========================================================
   FIREWORK
========================================================== */

function createFirework(){

    for(let i=0;i<25;i++){

        const star=document.createElement("div");

        star.textContent="✨";

        star.style.position="fixed";

        star.style.left=(window.innerWidth/2)+"px";

        star.style.top=(window.innerHeight/2)+"px";

        star.style.fontSize=

            (12+Math.random()*20)+"px";

        star.style.pointerEvents="none";

        star.style.zIndex="9999";

        document.body.appendChild(star);

        const angle=Math.random()*Math.PI*2;

        const distance=80+Math.random()*220;

        const x=Math.cos(angle)*distance;

        const y=Math.sin(angle)*distance;

        star.animate([

            {

                transform:"translate(0,0) scale(.5)",

                opacity:1

            },

            {

                transform:`translate(${x}px,${y}px) scale(1.8)`,

                opacity:0

            }

        ],{

            duration:1200,

            easing:"ease-out"

        });

        setTimeout(()=>{

            star.remove();

        },1200);

    }

}

/* ==========================================================
   FINISH STORY
========================================================== */

function finishStory(){

    clearInterval(state.timer);

    stopMoneyRain();

    state.playing=false;

    createFirework();

    if(bgMusic){

        bgMusic.volume=0.2;

    }

}

/* ==========================================================
   RESTART
========================================================== */

function restartStory(){

    clearInterval(state.timer);

    stopMoneyRain();

    state.playing=false;

    state.currentScene=0;

    showScene(0);

    if(light){

        light.classList.remove("active");

    }

    document.querySelectorAll(".money").forEach(item=>{

        item.remove();

    });

    safePause(bgMusic);

}

/* ==========================================================
   CLEANUP
========================================================== */

window.addEventListener("beforeunload",()=>{

    clearInterval(state.timer);

    stopMoneyRain();

    safePause(bgMusic);

});

/* ==========================================================
   DEBUG
========================================================== */

console.log("%c🎬 Story Engine 2.0 Loaded",

"color:#00c853;font-size:18px;font-weight:bold");

console.log("Total scenes:",scenes.length);

console.log("Ready!");