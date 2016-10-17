jQuery( document ).ready( function ( $ ) {
    "use strict";
    var data = {};

    function log() {
        if (window.console) console.log.apply(console, arguments);
    }

    function warn() {
        if (window.console) console.warn.apply(console, arguments);
    }

    function hideStep($wizard, stepId) {
        var $progress;
        $wizard.find('.fw-wizard-step[data-stepId="' + stepId + '"]')
            .removeClass('fw-current');
        $wizard.find('.fw-wizard-step-header[data-stepId="' + stepId + '"]')
            .removeClass('fw-current');
        $progress = $wizard.find('.fw-progress-step[data-id="' + stepId + '"]');
        $progress.removeClass('fw-active');
        $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + stepId + '"]').removeClass('fwp-active');
    }

    function showStep($wizard, stepId) {
        var $progress;
        $wizard.find('.fw-wizard-step[data-stepId="' + stepId + '"]')
            .addClass('fw-current');
        $wizard.find('.fw-wizard-step-header[data-stepId="' + stepId + '"]')
            .addClass('fw-current');
        $progress = $wizard.find('.fw-progress-step[data-id="' + stepId + '"]');
        $progress.addClass('fw-active');
    }

    function disablePrevious($wizard) {
        // $wizard.find('.fw-button-previous').prop('disabled', true);
        $wizard.find('.fw-button-previous').hide();
    }

    function disableNext($wizard) {
        // $wizard.find('.fw-button-next').prop('disabled', true);
        $wizard.find('.fw-button-next').hide();
    }

    function enablePrevious($wizard) {
        // $wizard.find('.fw-button-previous').prop('disabled', false);
        $wizard.find('.fw-button-previous').show();
    }

    function enableNext($wizard) {
        // $wizard.find('.fw-button-next').prop('disabled', false);
        $wizard.find('.fw-button-next').show();
    }

    function previous() {
        var $wizard = getWizard($(this));
        var step = getStep($wizard);
        var stepInt = parseInt(step, 10);
        var $circle = $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]');
        var $bar = $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 1) + '"]');
        var $progress = $wizard.find('.fw-progress-step[data-id="' + (stepInt - 1) + '"]');
        $progress.removeClass('fw-visited');
        $wizard.find('.fw-progress-step[data-id="' + step + '"]').removeClass('fw-visited');
        $circle.removeClass('fwp-done');
        $circle.find('.fwp-label').html(parseInt(step, 10) + 1);
        $bar.removeClass('fwp-active');
        if (stepInt >= 2) {
            $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 2) + '"]')
                .removeClass('fwp-done').addClass('fwp-active');

        }
        hideStep($wizard, step--);
        $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]')
            .find('.fwp-label').html(parseInt(step, 10) + 1);
        showStep($wizard, step);
        if (step === 0) {
            disablePrevious($wizard);
        }
        enableNext($wizard);
    }

    function next() {
        var $wizard = getWizard($(this));
        var step = getStep($wizard);
        var stepInt = parseInt(step, 10);
        var $circle = $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]');
        var $bar = $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + step + '"]');
        if(validateStep(step)) {
          $wizard.find('.fw-progress-step[data-id="' + step + '"]').addClass('fw-visited');
          $circle.removeClass('fwp-active').addClass('fwp-done');
          $circle.find('.fwp-label').html('&#10003;');
          $bar.addClass('fwp-active');
          if (stepInt >= 1) {
              $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 1) + '"]')
                  .removeClass('fwp-active').addClass('fwp-done');
          }
          hideStep($wizard, step++);
          showStep($wizard, step);
          if (step === (getStepCount($wizard) - 1)) {
              disableNext($wizard);
          }
          enablePrevious($wizard);
          // scroll back to top on next step
          $('html, body').animate({
            scrollTop: $("#mondula-multistep-forms").offset().top - 100
          }, 500);
        } else {
          // TODO alert
          console.log("STEP INVALID");
        }
    }

    function textSummary(summaryObj, $block, title, required) {
      var header = $block.find('label').text();
      var value = $block.find('.fw-text-input').val();
      pushToSummary(summaryObj, title, header, value, required);
    }

    function textareaSummary(summaryObj, $block, title, required) {
      var header = $block.find('label').text();
      var value = $block.find('.fw-textarea').val();
      pushToSummary(summaryObj, title, header, value, required);
    }

    function pushToSummary(summaryObj, title, header, value, required) {
      var s = {};
      if (value) {
        s[header] = value;
        getArray(summaryObj, title).push(s);
      } else if (required == 'true') {
        s['<p class="fw-step-summary fw-summary-invalid">' + header] = '</p>';
        getArray(summaryObj, title).push(s);
      }

    }

    function radioSummary(summaryObj, $block, title, required){
      var header = $block.find('.fw-block-header').text();
      var value = '';
      $block.find('.fw-radio-row').each(function(idx, element) {
        if($(element).find('.fw-radio').is(':checked')) {
          value = $(element).find('label').text();
        }
      });
      pushToSummary(summaryObj, title, header, value, required);
    }

    function checkboxSummary(summaryObj, $block, title, required) {
      var header = $block.find('label').text();
      var value;
      if ($block.find('.fw-checkbox').is(':checked')) {
        value = 'yes';
      }
      if($block.hasClass('fw-block-invalid')) {
        console.log('INVALID' + $block);
      }
      pushToSummary(summaryObj, title, header, value, required);
    }

    function stepSummary($wizard, stepNum, summaryObj) {
        var summary = '';
        var $step = $wizard.find('.fw-wizard-step[data-stepId="' + stepNum + '"]');
        $step.find('.fw-step-part').each(function (idx, element) {
            var title = $(element).find('.fw-step-part-title').text().trim();
            $(element).find('.fw-step-block').each(function (idx, element) {
              var required = $(element).attr('data-required');
              switch ($(element).attr('data-type')) {
                case 'fw-text': textSummary(summaryObj, $(element), title, required);
                  break;
                case 'fw-textarea': textareaSummary(summaryObj, $(element), title, required);
                  break;
                case 'fw-radio': radioSummary(summaryObj, $(element), title, required);
                  break;
                case 'fw-checkbox': checkboxSummary(summaryObj, $(element), title, required);
                  break;
              }
            });
        });
      return summary;
    }

    function getSummary($wizard) {
        var i;
        var stepCount = getStepCount($wizard);
        var summaryObj = {};
        for (i = 0; i < stepCount; i++) {
            stepSummary($wizard, i, summaryObj);
        }
        return summaryObj;
    }

    function getSummaryHtml($wizard) {
        var summaryHtml = '';
        var summaryObj = getSummary($wizard);
        for (var key in summaryObj) {
                summaryHtml += '<div class="fw-step-summary-part">';
                summaryHtml += renderStepSummaryTitle(key);
                summaryHtml += renderStepSummaries(summaryObj[key]);
                summaryHtml += '</div>';
        }
        return summaryHtml;
    }

    function renderStepSummaryTitle(title) {
        return '<p class="fw-step-summary-title">' + title + '</p>';
    }

    function renderStepSummary(summary) {
        var key;
        for (key in summary) {
            return '<p class="fw-step-summary">' + key + ' \u2014 ' + summary[key] + '</p>';
        }
    }

    function renderStepSummaries(summaries) {
        var i, n;
        var result = '';
        for (i = 0, n = summaries.length; i < n; i++) {
            result += renderStepSummary(summaries[i]);
        }
        return result;
    }

    function updateSummary($wizard) {
        var summary = getSummaryHtml($wizard);
        var $summary = $wizard.find('.fw-wizard-summary');
        $summary.empty();
        $summary.append(summary);
        $('.fw-toggle-summary').toggle(
          function(){
              $('.fw-wizard-summary').slideDown();
              $('.fw-toggle-summary').text('hide summary');
          },
          function(){
              $('.fw-wizard-summary').slideUp();
              $('.fw-toggle-summary').text('show summary');
          }
        );
        if ($('.fw-summary-invalid').length) {
          $summary.prepend('<div class="fw-summary-alert">Some required Fields are empty<br>Please check the highlighted fields.</div>');
        } else {
          $('.fw-summary-alert').remove();
        }
    }

    function getWizard($elt) {
        return $elt.closest('.fw-wizard');
    }

    function getStepCount($wizard) {
        return $wizard.attr('data-stepCount');
    }

    function getStep($wizard) {
        return $wizard.find('.fw-current').attr('data-stepId');
    }

    function getStepId($elt) {
        return $elt.closest('.fw-wizard-step').attr('data-stepId');
    }

    function getPartId($elt) {
        return $elt.closest('.fw-step-part').attr('data-partId');
    }

    function getBlockId($elt) {
        return $elt.closest('.fw-step-block').attr('data-blockId');
    }

    function get(obj) {
        var args = [].slice.call(arguments, 1);
        var i = 0, n = args.length;
        log('args', args);
        if (args[0] === "0") {
            throw new TypeError();
        }
        for (; i < n; i++) {
            obj = _get(obj, args[i]);
        }
        return obj;
    }

    function _get(obj, prop) {
        if (!obj[prop]) {
            obj[prop] = {};
        }
        return obj[prop];
    }

    function getObj($wizard, $target) {
        var stepId = getStepId($target);
        var partId = getPartId($target);
        var blockId = getBlockId($target);
        return get(data, $wizard.attr('id'), stepId, partId, blockId);
    }

    function getArray(obj, prop) {
        log('obj', obj, 'prop', prop);
        if (!obj[prop]) {
            obj[prop] = [];
        }
        return obj[prop];
    }

    function check() {
        var $target = $(this);
        var $wizard = getWizard($target);
        var checked = $target.prop('checked');
        var obj = getObj($wizard, $target);
        var optId = $target.attr('data-id');
        if (checked) {
            obj[optId] = "checked";
        } else {
            delete(obj[optId]);
        }

        updateSummary($wizard);
    }

    function unset($wizard, $target) {
        var wizardId = $wizard.attr('id');
        var group = $target.attr("name");
        var blockId = getBlockId($target);
        var $radios = $('.fw-radio[name="' + group + '"]');
        var multi = false;
        var stepId, partId, obj;
        log('radios', $radios);
        $radios.each(function (idx, element) {
            if (blockId !== getBlockId($(element))) {
                multi = true;
            }
        });
        stepId = getStepId($target);
        partId = getPartId($target);

        if (multi) {
            obj = get(data, wizardId, stepId);
            delete(obj[partId]);
        } else {
            obj = get(data, wizardId, stepId, partId);
            delete(obj[blockId]);
        }
        updateSummary($wizard);
    }

    function checkConditional() {
        var $target = $(this);
        var id = $target.attr('data-id');
        var $conditional = $target.closest('.fw-conditional');

        $conditional.find('.fw-conditional-then').removeClass('fw-selected');

        $conditional.find('.fw-conditional-then[data-id="' + id + '"]').addClass('fw-selected');

    }

    function checkRadio() {
        var $target = $(this);
        var $wizard = getWizard($target);
        unset($wizard, $target);
        var obj = getObj($wizard, $target);
        var optId = $target.attr('data-id');
        obj[optId] = "checked";

        updateSummary($wizard);
    }

    function textOnChange() {
        var $target = $(this);
        var $wizard = getWizard($target);
        var value = $target.val();
        log(value);
        var id = $target.attr('data-id');
        var obj = getObj($wizard, $target);
        obj[id] = value;
        $target.parents('.fw-step-block').removeClass('fw-block-invalid');
        updateSummary($wizard);
    }

    function dump() {
        var $wizard = getWizard($(this));
        log('step', getStep($wizard));
        log('stepCount', getStepCount($wizard));
        log('data', data);
        log('summary', getSummary($wizard));
    }

    function checkInvalidChange(event) {
      // remove fw-block-invalid when invalid text field is changed
      console.log($(this).parents('.fw-step-block'));
      if($block.hasClass('fw-block-invalid')){
        $block.removeClass('fw-block-invalid');
      }
    }

    function validateRadio($element) {
      var valid = false;
      $element.children('.fw-radio-row').find('.fw-radio').each(function(i, r) {
        var $r = $(r);
        if($r.is(':checked')) {
          console.log(i);
          valid = true;
        }
      });
      if (!valid) {
        $element.addClass('fw-block-invalid');
      }
      return valid;
    }

    function validateText($element) {
      if (!$element.find('.fw-text-input').val()) {
        $element.addClass('fw-block-invalid');
        return false;
      }
      return true;
    }

    function validateTextArea($element) {
      if (!$element.find('.fw-textarea').val()) {
        $element.addClass('fw-block-invalid');
        return false;
      }
      return true;
    }

    function validateCheckbox($element) {
      if (!$element.find('.fw-checkbox').prop('checked')) {
        $element.addClass('fw-block-invalid');
        return false;
      }
      return true;
    }

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    function validateSubmit($element) {
      var name = $element.find('[data-id=name]').val();
      var email = $element.find('[data-id=email]').val();
      var valid = true;
      if (!name || !email || !validateEmail(email)) {
        if ($element.has('input')) {
          valid = true;
        } else {
          $element.addClass('fw-block-invalid');
          valid = false;
        }
      }
      return valid;
    }

    function validateStep(idx){
      var valid = true;
      var stepValid = true;
      $('.fw-wizard-step[data-stepid="' + idx + '"] .fw-step-block[data-required="true"]').each(
          function (i, element) {
              var $element = $(element);
              var type = $element.attr('data-type');
              switch (type) {
                case 'fw-radio': valid = validateRadio($element);
                  break;
                case 'fw-textarea': valid = validateTextArea($element);
                  break;
                case 'fw-text': valid = validateText($element);
                  break;
                case 'fw-checkbox': valid = validateCheckbox($element);
                  break;
                case 'fw-submit': valid = validateSubmit($element);
                  break;
              }
              if(!valid){
                stepValid = false;
              }
          }
      );
      if (!stepValid) {
        // TODO: custom message
        alertUser('Please fill all the required fields!', false);
      }
      return stepValid;
    }

    function validate($wizard) {
        var formValid = true;
        $('.fw-wizard-step').each(function(idx, element) {
          var $step = $(element);
          if(!validateStep(idx)) {
            formValid = false;
          }
        });
        return formValid;
    }

    /**
     * responseMessage - the message that shows up after form submit
     *
     * @param  {string} rsp the response message
     * @param  {boolean} success successful submit of fail
     */
    function alertUser(message, success) {
      $('.fw-alert-user').empty().removeClass('fw-alert-user-fail fw-alert-user-success');
      if (success) {
        $('.fw-alert-user').addClass('fw-alert-user-success')
          .append('<i class="fa fa-check-circle" aria-hidden="true"></i>');
      }
      else {
        $('.fw-alert-user').addClass('fw-alert-user-fail')
          .append('<i class="fa fa-times-circle" aria-hidden="true"></i>');
      }
      $('.fw-alert-user').append(message)
        .fadeIn().delay(2000).fadeOut();
    }

    function submit(evt) {
        var summary, name, email;
        var $wizard = $(this).closest('.fw-wizard');
        // reset fw-block-invalid flags
        $('.fw-block-invalid').each(function(i, element) {
          $(element).removeClass('fw-block-invalid');
        })
        if (validate($wizard)) {
            summary = getSummary($wizard);
            console.log("Summary");
            console.log(summary);
            name = $wizard.find('[data-id="name"]').val();
            email = $wizard.find('[data-id="email"]').val();
            post(summary, name, email);
        }
    }

    function post(summary, name, email) {
        var id = $('#mondula-multistep-forms').attr('data-wizardid');
        $.post(
            ajax.ajaxurl,
            {
                action: 'fw_send_email',
                id : id,
                fw_data : summary,
                name: name,
                email: email,
                nonce: ajax.nonce
            },
            function (resp) {
                // TODO: customizable success message
                alertUser("Success! Your data was submitted.", true);
            }
        ).fail(function (resp) {
            warn('response', resp);
            warn('responseText', resp.responseText);
        });
    }

    function setup() {
        $('.fw-wizard').each(function (idx, element) {
            showStep($(element), 0);
        });

        $('.fw-progress-step[data-id="0"]').addClass('fw-active');
        $('.fw-button-previous').hide(); // prop('disabled', true);
        $('.fw-button-previous').click(previous);
        $('.fw-button-next').click(next);

        var showSummary = $('.fw-wizard-summary').attr('data-showsummary');
        if (showSummary == 'off') {
          $('.fw-toggle-summary').remove();
        }

        $('.fw-checkbox').change(check);
        $('.fw-radio').change(checkRadio);
        $('.fw-radio-conditional').change(checkConditional);
        $('.fw-text-input').on('change input', textOnChange);
        $('.fw-textarea').on('change input', textOnChange);
        $('.fw-checkbox, .fw-radio').on('change', function() {
          $(this).parents('.fw-step-block').removeClass('fw-block-invalid');
        });
        $('.fw-btn-submit').click(submit);

        // TODO: generate function for setting up
        //  colors
        var activeColor = $('.fw-progress-bar').attr('data-activecolor');
        var doneColor = $('.fw-progress-bar').attr('data-donecolor');
        var nextColor = $('.fw-progress-bar').attr('data-nextcolor');
        $('head').append('<style id="fw-colors"></style>')
        if (doneColor) {
          console.log('doneColor: ' + doneColor);
          $('head').append('<style>.fw-progress-step.fw-visited:before{ background:' + doneColor + ' !important; } .fw-progress-step.fw-visited { color:' + doneColor + ' !important;} ul.fw-progress-bar li.fw-visited:after{ background-color:'+ doneColor +'}</style>');
        }
        if (activeColor) {
          console.log('activeColor: ' + activeColor);
          $('head').append('<style>ul.fw-progress-bar li.fw-active:before{background:' + activeColor + '!important;} ul.fw-progress-bar li.fw-active { color: ' + activeColor +' }</style>');
        }
        if (nextColor) {
          console.log('nextColor: ' + nextColor);
          $('head').append('<style>ul.fw-progress-bar li:before{background:' + nextColor + ';} .fw-progress-bar li.fw-active:after, li.fw-progress-step::after{ background-color:'+ nextColor +';}</style>');
        }
        $('#mondula-multistep-forms').append('<p>powered by Multi-Step Form Builder</p>');
        $('#mondula-multistep-forms > p').css({ "font-size" : "0.8em", "margin-top" : "40px", "color": "#9e9e9e" });
        $('#mondula-multistep-forms > p').show();
        updateSummary($('.fw-wizard'));

    }

    function init () {
        // setInterval(poll, 50);
        $(document).ready(function (evt) {
            setup();
        });

    }

    init();
});

(function () {
    "use strict";
})();
