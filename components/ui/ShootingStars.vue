<template>
<div class="sky">
  <span />
  <span />
  <span />
  <span />
  <span />
  <span />
</div>
</template>

<style lang="scss" scoped>
.sky {
  position: fixed;
  top: 10%;
  height: 50%;
  width: 100vw;
  transform: rotateZ(36deg);
  span {
    position: absolute;
    top: 0;
    left: 0;
    height: 1.5px;
    background: linear-gradient(-45deg, #e8eefa, rgba(0,0,255,0));
    filter: drop-shadow(0 0 6px #f2f6ff);
    animation: tail 30s ease-in-out infinite, shooting 30s ease-in-out infinite;
    &::before, &::after {
      position: absolute;
      content: "";
      top: calc(50% - 1px);
      right: 0;
      height: 1px;
      background: linear-gradient(-45deg, rgba(0,0,255,0), #e8eefa, rgb(206, 206, 206));
      transform: translateX(50%) rotateZ(45deg);
      animation: shining 30s ease-in-out infinite;
    }
  }
  span:after {
    transform: translateX(50%) rotateZ(-45deg);
  }
  span:nth-child(1) {
    top: calc(100% - 200px);
    left: calc(50% - 450px);
    animation-delay: 5s;
    &::before, &::after {
      animation-delay: 5s;
    }
  }
  span:nth-child(2) {
    top: calc(25% - 175px);
    left: calc(33% + 200px);
    animation-delay: 10s;
    &::before, &::after {
      animation-delay: 10s;
    }
  }
  span:nth-child(3) {
    top: calc(100% - 0px);
    left: calc(50% - 800px);
    animation-delay: 0s;
    &::before, &::after {
      animation-delay: 0s;
    }
  }
  span:nth-child(4) {
    top: calc(100% - 100px);
    left: calc(50% - 600px);
    animation-delay: 15s;
    &::before, &::after {
      animation-delay: 15s;
    }
  }
  span:nth-child(5) {
    top: calc(100% - 300px);
    left: calc(50% - 400px);
    animation-delay: 20s;
    &::before, &::after {
      animation-delay: 20s;
    }
  }
  span:nth-child(6) {
    top: 40%;
    left: 20%;
    animation-delay: 22s;
    &::before, &::after {
      animation-delay: 22s;
    }
  }
}

@keyframes tail {
  90% {
    width: 0; /* Almost gone */
  }
  93% {
    width: 100px; /* Maximum width reached just before disappearing */
  }
  100% {
    width: 0; /* Fully gone */
  }
}

@keyframes shining {
  90% {
    width: 0; /* Almost gone */
  }
  93% {
    width: 8px; /* Maximum shining width just before disappearing */
  }
  100% {
    width: 0; /* Fully gone */
  }
}

@keyframes shooting {
  90% {
    transform: translateX(0); /* Start position */
  }
  100% {
    transform: translateX(1000px); /* Final position */
  }
}
</style>