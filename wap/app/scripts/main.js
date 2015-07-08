'use strict'
//详情页+帮助中心
$(function() {
  var end = parseFloat($('#arc').attr('data-end'));
  var start = parseFloat($('#arc').attr('data-start')) || 0;
  drawCircle(start, end);

  var leftTime = $('.lefttime').attr('data-time');
  countDown(leftTime, $('.lefttime'));
  //加息券显示
  var getInterestTicket = function() {
    var selectInterestTicket = {};
    if (localStorage.getItem('interestTicket') !== null) {
      selectInterestTicket = JSON.parse(localStorage.getItem('interestTicket'));
      if (selectInterestTicket.title === document.title) {
        if (isAndroid) {
          selectInterestTicket.item.raiseInterestRate = '+' + selectInterestTicket.item.raiseInterestRate + '%';
        }
        $('#interestTicket').html(selectInterestTicket.item.raiseInterestRate + ' ><span class="tag-arrow orange-light"></span>');
      } else {
        localStorage.removeItem('interestTicket');
      }
    }
    return selectInterestTicket;
  };
  getInterestTicket();
  //客户端&微信特殊处理
  if (isWechat) {
    $('.nav').hide();
  }
  if (isClient) {
    //隐藏头部
    $('.nav').hide();
    //帮助中心
    $('#callService,.help-banner').on('click', function() {
      SYDBridge.openNative('callService');
    });
    $('#onlineService').on('click', function() {
      SYDBridge.openNative('serviceOnline');
    });
    //android&转让标计算器隐藏
    if ($('body').attr('data-type') !== 'zrb' && !/souyidai 22/.test(navigator.userAgent)) {
      $('.cal').show();
    }
    //玫瑰图
    if (isiOS) {
      var tagShow = setTimeout(function() {
        $('.graph-tag').show();
      }, 2800);
    } else {
      if (isAndroid4_3) {
        var roseGraphAnimate = $('animate');
        for (var i = 0; i < roseGraphAnimate.length; i++) {
          $('circle').eq(i).attr('r', roseGraphAnimate.eq(i).attr('to'));
        };
        $('.graph-tag').show();
      } else {
        var tagShow = setTimeout(function() {
          $('.graph-tag').show();
        }, 2800);
      }
    }
    //投标 计算器
    $('#invest').on('click', function() {
      var data = {
        bidId: $('body').attr('data-bidId'),
        bidType: $('body').attr('data-type')
      };
      var selectInterestTicket = getInterestTicket();
      if (selectInterestTicket.hasOwnProperty('item')) {
        data.interestTicketId = selectInterestTicket.item.interestTicketId || selectInterestTicket.item.id;
      }
      if ($('body').attr('data-type') === 'zrb') {
        if (isiOS && (buildNo > 1.6 && buildNo < 2.2)) {
          data.investUrl = 'https://m.souyidai.com/1.1/bid/dobid/' + $('body').attr('data-bidId');
        }
      }
      window.bidType = $('body').attr('data-type');
      SYDBridge.openNative('doBid', data);
    });
    $('.btn-bottom .cal').on('click', function() {
      var data = {
        bidId: $('body').attr('data-bidId'),
        bidAmount: $('body').attr('data-amount')
      };
      window.bidAmount = $('body').attr('data-amount');
      SYDBridge.openNative('culator', data);
    });
    //担保函 协议
    $('.list-btn-na,.help-row-item').on('click', function() {
      var btnType = $(this).attr('data-type');
      var title = $(this).attr('data-title');
      var url = $(this).attr('data-url');
      if (btnType === 'image') {
        var guaranteedetail = $(this).attr('data-guaranteedetail') || '';
        var guaranteename = $(this).attr('data-guaranteename') || '';
        var data = {
          images: []
        };
        var img = {
          title: title,
          url: url,
          guaranteename: guaranteename,
          guaranteedetail: guaranteedetail
        };
        data.images.push(img);
        window.imageView = title + '|' + url;

        if (buildNo <= 23 && isAndroid) {
          window.tenderDetail.imageBrowser(title, url);
        } else {
          SYDBridge.openNative('imageBrowser', data);
        }
      } else if (btnType === 'url') {
        var data = {
          webViewUrl: url
        };
        window.webViewUrl = url;
        SYDBridge.openNative('webview', data);
      } else {
        return;
      }
    });
    //加息券
    $('#interestTicket').on('click', function() {
      var data = {
        bidId: $('body').attr('data-bidId')
      };
      var selectInterestTicket = getInterestTicket();
      if (selectInterestTicket.hasOwnProperty('item')) {
        data.interestTicketId = selectInterestTicket.item.interestTicketId || selectInterestTicket.item.id;
      }
      SYDBridge.openNative('interestTicket', data);
    });
  } else {
    $('#invest').on('click', function() {
      location.href = '/1.1/bid/dobid/' + $('body').attr('data-bidId');
    });
    $('.list-btn-na').on('click', function() {
      var btnType = $(this).attr('data-type');
      if (btnType === 'image') {
        window.open($(this).attr('data-url'), '_blank');
      } else if (btnType === 'url') {
        window.open($(this).attr('data-url'), '_blank');
      } else {
        return;
      }
    });
  }

  var status = $('body').attr('data-status');
  if (status !== '16' && status !== '11') {
    $('.btn-bottom').hide();
    $('body').css('padding-bottom', '0');
  }

  $('#auth').on('click', function() {
    var _this = $(this);
    _this.next().toggle();
    if (_this.find('.icon-chevron-right').hasClass('down')) {
      _this.find('.icon-chevron-right').removeClass('down');
      _this.find('.icon-chevron-right').addClass('up');
    } else {
      _this.find('.icon-chevron-right').removeClass('up');
      _this.find('.icon-chevron-right').addClass('down');
    }
  });
  var score = $('.rose-graph-star').attr('data-score') / 10 || 3.5;
  var starHtml = '<span class="star star-full"></span><span class="star star-full"></span><span class="star star-full"></span>';
  if (score === 3.5) {
    starHtml = starHtml + '<span class="star star-half"></span><span class="star star-empty"></span>';
  } else if (score === 4) {
    starHtml = starHtml + '<span class="star star-full"></span><span class="star star-empty"></span>';
  } else if (score === 4.5) {
    starHtml = starHtml + '<span class="star star-full"></span><span class="star star-half"></span>';
  } else {
    starHtml = starHtml + '<span class="star star-full"></span><span class="star star-full"></span>';
  }
  $('.rose-graph-star').html(starHtml);
  if ($('.tab-list').length !== 0) {
    $(window).on('scroll', function() {
      var triggerTop = 0;
      if (!isClient && !isWechat) {
        triggerTop = 44;
      }
      if ($(window).scrollTop() > triggerTop) {
        if ($('.tab-list').hasClass('tab-fixed')) {
          return;
        } else {
          $('.tab-list').addClass('tab-fixed');
          $('body').addClass('fixed');
        }
      } else {
        $('.tab-list').removeClass('tab-fixed');
        $('body').removeClass('fixed');
      }
    });
  }
});
