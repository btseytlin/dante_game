const UIScale = 0.5;
const textHideDelay = 2000;
const textCharDrawDelay = 7;

const plySpeed = 500;
const changeLevelDelay = 1500;
const virgilSpeed = 500;
const virgilFollowThreshold = 200;

const [viewportWidth, viewportHeight] = getViewport();
const maxWidth = 800;
const minWidth = 600;
const maxHeight = 600;
const minHeight = 400;

console.log(Math.min(maxHeight, viewportHeight), )

const screenWidth = Math.max(Math.min(maxWidth, viewportWidth), minWidth);
const screenHeight = Math.max(Math.min(maxHeight, viewportHeight), minHeight);