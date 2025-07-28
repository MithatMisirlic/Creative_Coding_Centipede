let segments = [];
let totalSegments = 5;
let segmentLength = 18;
let targetPos;
let easing = 0.05;
let foods = [];

let lifeTime = 5;
let lastDecayTime = 0;
let isDead = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < totalSegments; i++) {
        segments.push(createVector(width / 2, height / 2));
    }
    targetPos = createVector(width / 2, height / 2);
    spawnMultipleFood();
    lastDecayTime = millis();
}

function draw() {
    background(20, 20, 30);

    updateHeadTarget();
    segments[0] = targetPos.copy();

    // Make body segments follow each other
    for (let i = 1; i < segments.length; i++) {
        let target = segments[i - 1];
        let current = segments[i];
        let dir = p5.Vector.sub(target, current);
        dir.setMag(segmentLength);
        segments[i] = p5.Vector.sub(target, dir);
    }

    // LIFE UI & decay
    if (!isDead) {
        fill(255);
        textSize(18);
        textAlign(RIGHT, TOP);
        text("LIFE: " + lifeTime.toFixed(0), width - 20, 20);

        if (millis() - lastDecayTime > 5000) {
            lastDecayTime = millis();
            lifeTime -= 5;

            if (segments.length > 1) {
                segments.pop();
            }

            if (lifeTime <= 0 || segments.length <= 1) {
                isDead = true;
                return;
            }
        }
    }

    // FOOD
    for (let i = foods.length - 1; i >= 0; i--) {
        let food = foods[i];
        noStroke();
        fill(255, 255, 100);
        ellipse(food.x, food.y, 15);

        if (p5.Vector.dist(segments[0], food) < 20) {
            foods.splice(i, 1);
            segments.push(segments[segments.length - 1].copy());
            lifeTime += 1;
        }
    }

    if (foods.length === 0 && !isDead) {
        spawnMultipleFood();
    }

    // CENTIPEDE RENDERING
    for (let i = segments.length - 1; i >= 0; i--) {
        let pos = segments[i];

        if (i === 0) {
            // Head
            let next = segments[1];
            let dir = p5.Vector.sub(pos, next).normalize();
            let headAngle = atan2(dir.y, dir.x);

            push();
            translate(pos.x, pos.y);
            rotate(headAngle);

            noStroke();
            fill(255, 50, 50);
            ellipse(0, 0, segmentLength * 1.6, segmentLength * 1.4);

            // Pinchers
            stroke(255);
            strokeWeight(2);
            noFill();
            let pinchBaseY = segmentLength * 0.4;
            let pinchLength = 12;
            let pinchSpread = PI / 6;
            for (let side of [-1, 1]) {
                let angle = -PI / 2 + side * pinchSpread;
                let baseX = side * 4;
                let baseY = pinchBaseY;
                let tipX = baseX + cos(angle) * pinchLength;
                let tipY = baseY + sin(angle) * pinchLength;
                line(baseX, baseY, tipX, tipY);
            }

            // Eyes
            fill(0);
            noStroke();
            ellipse(-4, -4, 4, 4);
            ellipse(4, -4, 4, 4);
            pop();

        } else {
            // Body
            noStroke();
            fill(120 + i * 3, 200 - i * 5, 255 - i * 4);
            ellipse(pos.x, pos.y, segmentLength);

            // Legs
            let prev = segments[i - 1];
            let dir = p5.Vector.sub(prev, pos).normalize();
            let normal = createVector(-dir.y, dir.x);
            let legBaseOffset = segmentLength * 0.6;
            let upperLegLength = 8;
            let lowerLegLength = 6;
            let legSpread = PI / 4;
            let legBend = PI / 3;
            let wiggle = sin(frameCount * 0.2 + i) * 0.2;

            stroke(255);
            strokeWeight(2);
            for (let side of [-1, 1]) {
                let base = p5.Vector.add(pos, p5.Vector.mult(normal, legBaseOffset * side));
                let angle = atan2(dir.y, dir.x) + wiggle + legSpread * side;
                let joint = p5.Vector.add(base, p5.Vector.fromAngle(angle, upperLegLength));
                let foot = p5.Vector.add(joint, p5.Vector.fromAngle(angle + legBend * side, lowerLegLength));
                line(base.x, base.y, joint.x, joint.y);
                line(joint.x, joint.y, foot.x, foot.y);
            }
        }
    }

    // DEATH SCREEN
    if (isDead) {
        background(0, 0, 0, 240);
        push();
        translate(width / 2, height / 2 - 50);
        fill(255);
        stroke(0);
        strokeWeight(2);
        ellipse(0, 0, 80, 100); // skull

        // X eyes
        stroke(0);
        strokeWeight(3);
        line(-20, -10, -10, -20);
        line(-20, -20, -10, -10);
        line(10, -10, 20, -20);
        line(10, -20, 20, -10);

        // Mouth
        stroke(0);
        line(-10, 25, 10, 25);
        pop();

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("The Centipede died\nbecause you didn’t feed it.", width / 2, height / 2 + 40);

        noLoop();
    }

    if (millis() - lastDecayTime > 2000) { // was 5000, now 2000ms = 2s
        lastDecayTime = millis();
        lifeTime -= 1; // smaller step for smoother countdown

        if (segments.length > 1) {
            segments.pop(); // always remove one segment per tick
        }

        if (lifeTime <= 0 || segments.length <= 1) {
            isDead = true;
            return;
        }
    }
}

function spawnMultipleFood() {
    let count = floor(random(2, 6));
    for (let i = 0; i < count; i++) {
        foods.push(createVector(random(50, width - 50), random(50, height - 50)));
    }
}

function updateHeadTarget() {
    if (isDead) return;

    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let mouse = createVector(mouseX, mouseY);
        let delta = p5.Vector.sub(mouse, targetPos).mult(easing);
        targetPos.add(delta);
    } else {
        let t = frameCount * 0.01;
        targetPos.x = width / 2 + sin(t) * 100;
        targetPos.y = height / 2 + cos(t * 0.7) * 80;
    }
}