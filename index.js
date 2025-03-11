function animaster() {
    let _steps = [];

    //сбросы
    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
        element.classList.remove('show');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transform = null;
        element.style.transitionDuration = null;
    }

    /**
     * Вспомогательная функция, возвращающая CSS-трансформ
     * в зависимости от переданного смещения и коэффициента масштаба
     */
    function getTransform(translation, ratio, rotateAngle) {
        const result = [];
        if (translation) {
            result.push(`translate(${translation.x}px, ${translation.y}px)`);
        }
        if (ratio) {
            result.push(`scale(${ratio})`);
        }
        if (rotateAngle) {
            result.push(`rotate(${rotateAngle}deg)`);
        }
        return result.join(' ');
    }
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio, null);
    }

    /**
     * Методы добавления шагов анимации в приватный массив _steps
     */

    function rotate(element, duration, angle, origin = 'center center') {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transformOrigin = origin;
        element.style.transform = getTransform(null, null, angle);
    }

    function addMove(duration, translation) {
        _steps.push({
            type: 'move',
            duration,
            translation
        });
        return this;
    }

    function addScale(duration, ratio) {
        _steps.push({
            type: 'scale',
            duration,
            ratio
        });
        return this;
    }

    function addFadeIn(duration) {
        _steps.push({
            type: 'fadeIn',
            duration
        });
        return this;
    }


    function addFadeOut(duration) {
        _steps.push({
            type: 'fadeOut',
            duration
        });
        return this;
    }

    function addDelay(duration) {
        _steps.push({
            type: 'delay',
            duration
        });
        return this;
    }

    function addRotate(duration, angle, origin = 'center center') {
        _steps.push({
            type: 'rotate',
            duration,
            angle,
            origin
        });
        return this;
    }
    /**
     * Метод play – последовательно проигрывает шаги анимации из _steps
     * Можно вызвать с флагом cycled=true, чтобы шаги повторялись бесконечно
     */
    function play(element, cycled = false) {
        const wasHidden = element.classList.contains('hide');  // скрыт ли элемент изначально
        const originalTransition = element.style.transitionDuration;
        const originalTransformOrigin = element.style.transformOrigin;
        const originalTransform = element.style.transform;
        const originalClassList = [...element.classList];

        let isStopped = false;
        let currentStep = 0;
        let timeouts = [];



        function applyStep(step) {
            switch (step.type) {
                case 'move':
                    move(element, step.duration, step.translation);
                    break;
                case 'scale':
                    scale(element, step.duration, step.ratio);
                    break;
                case 'fadeIn':
                    fadeIn(element, step.duration);
                    break;
                case 'fadeOut':
                    fadeOut(element, step.duration);
                    break;
                case 'delay':
                    element.style.transitionDuration = null;
                    break;
                case 'rotate':
                    rotate(element, step.duration, step.angle, step.origin);
                    break;
            }
        }

        function runNextStep() {
            if (isStopped) return;
            if (currentStep >= _steps.length) {
                if (cycled) {
                    currentStep = 0;
                } else {
                    return;
                }
            }

            const step = _steps[currentStep];
            currentStep++;

            applyStep(step);
            const timeoutId = setTimeout(runNextStep, step.duration);
            timeouts.push(timeoutId);
        }

        runNextStep();

        /**
         * Возвращаем объект с методами управления анимацией
         */
        return {
            stop() {
                isStopped = true;
                timeouts.forEach(t => clearTimeout(t));
            },
            reset() {
                this.stop();
                element.style.transitionDuration = originalTransition;
                element.style.transform = originalTransform;
                element.style.transformOrigin = originalTransformOrigin;
                element.className = '';
                originalClassList.forEach(cls => element.classList.add(cls));

                if (wasHidden) {
                    element.classList.add('hide');
                    element.classList.remove('show');
                } else {
                    element.classList.remove('hide');
                }
            }
        };
    }

    function moveAndHide(element, duration) {
        const moveDuration = (duration * 2) / 5;
        const fadeDuration = (duration * 3) / 5;

        return animaster()
            .addMove(moveDuration, { x: 100, y: 20 })
            .addFadeOut(fadeDuration)
            .play(element);
    }

    function showAndHide(element, duration) {
        const part = duration / 3;
        return animaster()
            .addFadeIn(part)
            .addDelay(part)
            .addFadeOut(part)
            .play(element);
    }

    function heartBeating(element) {
        return animaster()
            .addScale(500, 1.4)
            .addScale(500, 1)
            .play(element, true);
    }

    /**
     * Метод buildHandler – возвращаем такую функцию, которую
     * можно передать напрямую в addEventListener.
     * addEventListener вызывает обработчик так, что внутри него
     * this ссылается на DOM-элемент. Поэтому делаем обёртку:
     */
    function buildHandler() {
        const that = this;
        return function() {
            that.play(this);
        };
    }

    return {
        fadeIn,
        fadeOut,
        move,
        scale,
        rotate,

        moveAndHide,
        showAndHide,
        heartBeating,

        addMove,
        addScale,
        addFadeIn,
        addFadeOut,
        addDelay,
        addRotate,
        play,
        buildHandler,

        resetFadeIn,
        resetFadeOut,
        resetMoveAndScale,

        _steps
    };
}

/**
 * Функция, которая вешает обработчики на разные кнопки на странице.
 * Здесь показан пример. Подставьте свои id элементов в getElementById.
 */
function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });



    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    //сдвинуть и скрыть кнопки
    let moveAndHideAnimation;
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideAnimation = animaster().moveAndHide(block, 1000);
        });
    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
        });

    // показать и скрыть (кнопка)
    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 3000);
        });

    //добавили stop сердцебиениб
    let heartBeatingAnimation;
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingAnimation = animaster().heartBeating(block);
        });
    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }
        });

    const worryAnimationHandler = animaster()
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .buildHandler();

    document
        .getElementById('worry')
        .addEventListener('click', worryAnimationHandler);

    document.getElementById('rotatePlay')
        ?.addEventListener('click', function () {
            const block = document.getElementById('rotateBlock');

            animaster()
                .addRotate(500, 180, 'bottom left')
                .addRotate(500, 360, 'bottom left')
                .play(block);
        });
}

addListeners();