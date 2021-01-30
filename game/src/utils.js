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
}

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

    const hide_timer_event = {
        delay: textCharDrawDelay * phrase.length + textHideDelay,
        callback: function(text){
            text.text.setVisible(0);
            text.text.setText('');
            if (text.draw_timer) {
                text.draw_timer.remove();
            }
        },
        args: [obj.text],
    }

    obj.text.hide_timer = scene.time.addEvent(hide_timer_event);
    obj.text.text.setVisible(1);
}
