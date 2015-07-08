'use strict'
//投标 + 投标结果
var currentBalance = parseFloat($('body').attr('data-currentbalance'));
var bidType = $('body').attr('data-type');
var bidLimit = parseFloat($('body').attr('data-limit'));
var couponAmount = parseFloat($('body').attr('data-coupon'));

$(function() {
  // var ranges = document.querySelectorAll('input[type=range]');
  // if (ranges.length !== 0) {
  //  var range = ranges[0];
  //  range.oninput = function() {
  //    var value = (range.value - range.min) / (range.max - range.min);
  //    $('#amount').val(range.value);
  //    range.style.backgroundImage = [
  //      '-webkit-gradient(',
  //      'linear, ',
  //      'left top, ',
  //      'right top, ',
  //      'color-stop(' + value + ', #53a0e3), ',
  //      'color-stop(' + value + ', #ececec)',
  //      ')'
  //    ].join('');
  //  };
  //  range.oninput();
  // }
  var inputVal = 0;
  $('#amount').on('focus', function() {
    inputVal = $(this).val();
    $(this).val('');
    $('#amount').trigger('input');
  });
  $('#amount').on('input', function() {
    var _this = $(this);
    var val = parseFloat(_this.val()) || 0;

    if (bidType !== 'zrb') {
      if (val > (currentBalance + couponAmount)) {
        _this.addClass('overflow');
        _this.parent().addClass('has-error');
      } else {
        _this.removeClass('overflow');
        _this.parent().removeClass('has-error');
      }
    } else {
      if (val > (currentBalance + couponAmount) || val < 100) {
        _this.addClass('overflow');
        _this.parent().addClass('has-error');
      } else {
        _this.removeClass('overflow');
        _this.parent().removeClass('has-error');
      }

      var transVal = val * 100;
      var amount = parseInt($('body').attr('data-amount'));
      var principal = parseInt(bidLimit) * 100;
      var discount = parseInt($('.bid-real-amount').attr('data-discount'));
      var interest = parseInt($('.bid-real-amount').attr('data-interest'));

      if (transVal >= (bidLimit * 100)) {
        transVal = (bidLimit * 100);
        _this.val(transVal / 100);
      }
      var realAmount = ((transVal * amount) / principal) / 100;
      var realInterest = ((transVal * interest) / principal) / 100;
      var realDiscount = ((transVal * discount) / principal) / 100;

      $('.bid-real-amount span').text(realAmount.toFixed(2).replace(/(\d)(?=(?:\d{3})+(?:\.\d+)?$)/g, '$1,') + '元');
      $('#discount').text(realDiscount.toFixed(2).replace(/(\d)(?=(?:\d{3})+(?:\.\d+)?$)/g, '$1,') + '元');
      $('#interest').text(realInterest.toFixed(2).replace(/(\d)(?=(?:\d{3})+(?:\.\d+)?$)/g, '$1,') + '元');
    }
  });

  // if (bidType !== 'zrb') {
  //  $('#amount').on('blur', function() {
  //    var val = parseInt($(this).val()) || inputVal;
  //    if (val > currentBalance + couponAmount) {
  //      $('.form-range').val(currentBalance + couponAmount);
  //    } else {
  //      $('.form-range').val(val);
  //    }
  //    range.oninput();
  //  });
  // }
  $('.invest-limit').on('click', function() {
    dialogShow('#limit');
  });
  $('#dobid').on('click', function() {
    var amountInput = $('#amount').val();
    if (!checkInput($("#amount"))) {
      return;
    }
    disBtn($(this));
    $.ajax({
      url: '/1.1/bid/invest/money',
      type: 'POST',
      data: {
        bidId: $('body').attr('data-bidId'),
        inputAmount: amountInput
      },
      dataType: 'json',
      success: function(res) {
        if (res.errorCode === 2) {
          dialogShow('#charge');
          return;
        };
        if (errorHandle(res)) {
          var investResult = $('#bid .dialog-invest-info span');
          investResult.eq(0).text(res.data.investAmount);
          if (bidType !== 'zrb') {
            investResult.eq(1).text(res.data.useAmount);
            investResult.eq(2).text(res.data.useCoupon);
          } else {
            investResult.eq(1).text(res.data.principalAmount);
            investResult.eq(2).text(res.data.intrestAmount);
            investResult.eq(3).text(res.data.discountAmount);
          }
          var Timer = 0;
          if (res.data.leftTimeBeforeOpen === 0) {
            enBtn($('#bid-confirm'));
            $('.dialog-header').html('确认投资');
            $('#bid-confirm').addClass('btn-default');
          } else {
            var header = '<span class="countDown">00时00分00秒</span>后即可投资';
            $('.dialog-header').html(header);
            window.clearInterval(Timer);
            Timer = countDown(res.data.leftTimeBeforeOpen, $('.countDown'));
          }
          dialogShow('#bid');
        }
      },
      complete: function() {
        enBtn($('#dobid'));
      }
    });
  });
  $('#bid-confirm').on('click', function() {
    var amountInput = $('#amount').val();
    disBtn($(this));
    $.ajax({
      url: '/1.1/bid/dobid',
      type: 'POST',
      data: {
        bidId: $('body').attr('data-bidId'),
        bidAmount: amountInput
      },
      dataType: 'json',
      success: function(res) {
        if (res.errorCode === 2) {
          dialogShow('#charge');
          return;
        };
        if (errorHandle(res)) {
          location.href = '/1.1/bid/dobid/result/' + $('body').attr('data-bidId');
        }
      },
      complete: function() {
        enBtn($('#bid-confirm'));
      }
    });
  });
});

var checkInput = function(input) {
  var val = input.val();
  val = val.replace(/[^\d.-]/g, "");
  val = val.replace(/^-/g, "");
  val = val.replace(/-|^\.|\d+(?:\.\d*){2,}/g, "");
  //val = val.replace(/\./g, "");
  val = val.replace(/^0*/, '');
  val = parseFloat(val);

  if ((isNaN(val) || val === 0 || val % 1 !== 0) && val != bidLimit) {
    toastShow('请输入合法的整数金额');
    input.val(0);
    return false;
  }
  if (val > (currentBalance + couponAmount)) {
    dialogShow('#charge');
    return false;
  }
  if (bidType === 'zrb' && val < 100 && val != bidLimit) {
    toastShow('投资金额不能小于100元');
    return false;
  }
  if (bidType !== 'zrb' && val > bidLimit) {
    toastShow('已经超过每用户投资金额的上限,请投其他项目!');
    //超过限额
    return false;
  }
  return true;
};
