/* Util functions */
function loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

function objectFromSpawnPoint(scene, spawn_point_obj, sprite_key) {
    let obj = scene.physics.add.sprite(spawn_point_obj.x, spawn_point_obj.y, sprite_key); 
    spawn_point_obj.destroy();
    return obj;
}

function clearDrawnDialogue(scene, obj) {
    /* Speeds up drawing if text is still printing or clears up dialogue if its finished */
    if (obj.text.draw_timer) {
        obj.text.draw_timer.remove();
    }
    if (obj.text.hide_timer) {
        obj.text.hide_timer.remove();
    }

    obj.text.text.setVisible(0);
    obj.text.text.setText('');

}

function displayFullPhrase(scene, obj) {
    if (obj.text.draw_timer && obj.text.draw_timer.getRepeatCount() > 1) {
        obj.text.text.setText(obj.text.draw_timer.args[1])
        obj.text.draw_timer.remove();
        return true;
    }
}

function hideCallback(scene, obj, draw_next=false) {
    const phrase = obj.text.cur_phrase;
    const hide_timer_event = {
        delay: textCharDrawDelay * phrase.length * 1.5 + textHideDelay,
        callback: function(text){
            clearDrawnDialogue(scene, obj);
            if (draw_next) {
                if (obj.text.cur_phrase_num == obj.text.dialogues.phrases.length-1) {
                    obj.text.cur_phrase_num = -1;
                } else {
                    drawNextPhrase(scene, obj);
                }
            }
        },
        args: [obj.text],
    }
    obj.text.hide_timer = scene.time.addEvent(hide_timer_event);
};


function drawDialoguePhrase(scene, obj, phrase) {
    const draw_timer_event = {
        delay: textCharDrawDelay,
        callback: function(text, phrase_text){
            if (!this.char) {
                this.char = 1;
            }
            const visibleText = phrase_text.slice(0, this.char);
            const invisibleText = '[color=transparent]'+phrase_text.slice(this.char, phrase_text.length)+'[/color]';
            //console.log(visibleText+invisibleText);
            text.setText(visibleText+invisibleText);
            this.char += 1;
        },
        args: [obj.text.text, phrase],
        repeat: phrase.length,
    }
    obj.text.text.setText('[color=transparent]'+phrase+'[/color]');
    obj.text['draw_timer'] = scene.time.addEvent(draw_timer_event);

    obj.text.text.setVisible(1);
    hideCallback(scene, obj, draw_next = (obj.text.dialogues.type != 'click') );
}

function drawNextPhrase(scene, obj) {
    const next_phrase = (obj.text.cur_phrase_num+1) % obj.text.dialogues.phrases.length
    const next_phrase_text = obj.text.dialogues.phrases[next_phrase];
    const after_draw = obj.text.dialogues.type == 'click' ? 'hide' : 'next';
    obj.text['cur_phrase_num'] = next_phrase;
    obj.text['cur_phrase'] = next_phrase_text;

    const callback = obj.text.dialogues.type == 'click' ? hideCallback : hideCallback;
    drawDialoguePhrase(scene, obj, next_phrase_text);
}