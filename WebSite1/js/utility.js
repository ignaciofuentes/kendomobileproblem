var ms = 900000;
var init = false;
var showTotal = false;
var showConfirmTotal = false;
var orderTemplate, orderAddress, tm;
var NO_RECORDS = '<h4 class="txt" style="color:Red; background-color:LightGray !important;">No records found matching criteria.</h4>';
var jsonProfile;
var GOBACK = false;
var tabStrip;
var V_ERROR = false;
var TIME_OUT = 300;

function logOut(e) {
  try {
    $(".ord_tot").hide();
    $(".ord_tot_confirm").hide();

    clearAll();

    $(".lnkHide").hide();
    showLoad();
    $.ajax({
      url: "WebController.aspx?mn=LogOut&logout=true&rn=" + Math.random().toString().replace(".", ""),
      cache: false,
      dataType: "json",
      success: function (data) {
        //document.location.href = "home.aspx#login";
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
    setTimeout(function () {
      hideLoad();
    }, TIME_OUT);
  }
  catch (err) {
    hideLoad();
    showModalView("Error trying to log out: " + err.Message, true)
  }
  tabStrip.switchTo("#home")
  app.navigate("#login");
}
function navigatePage(e) {
  $(".ord_tot").hide();
  $(".ord_tot_confirm").hide();

  showTotal = false;
  showConfirmTotal = false;
  var i = $(".ddLoc").length;
  for (z = 1; z <= i; z++) {
    $(".ddLoc")[z - 1].selectedIndex = 0; // force all location dropdowns to a "select a location"
  }
  if (sessionStorage.usermode == 1) {
    $(".pendline").remove();
  }

  if (!sessionStorage.userauth) {
    e.preventDefault();
    if (tabStrip.currentItem().index() > 0) {
      tabStrip.switchTo("#home");
      app.navigate("#login");
    }
  } else if (e.item[0].id == 'lnkPendingReport') {
    if (sessionStorage.usermode == 2) {
      bindPendingOrdersRPT();
    }
  } else if (e.item[0].id == 'lnkAccountPrefs') { resetPrefs(); }

}
function processLogin(e) {
  try {
    
    if (e.item[0].id != 'liLogin') { return; }
    clearOrder(null);
    var chk = $("#chkremember").is(':checked');
    var chkGrp = $("#chkGroup").is(':checked');
    var chkTms = $("#chkTerms").is(':checked');

    if ($("#txtusername").val() == "") {
      showModalView("Account Is Required.", false);
      return;
    }
    if ($("#txtpassword").val() == "") {
      showModalView("Password Is Required.", false);
      return;
    }

    if (chkGrp) {
      if ($("#txtgroupname").val() == "") {
        showModalView("Group Name Is Required.", false);
        return;      
      }
    } else {
      if ($("#txtlocationnum").val() == "") {
        showModalView("Location # Is Required.", false);
        return;
      }
    }
    
    if (!chkTms) {
      showModalView("You Must Accept the Terms & Conditions.", false);
      return;
    }

    showLoad(); // app.showLoading();

    if (chkGrp) { sessionStorage.tmpgroup = true } else { sessionStorage.tmpgroup = false }
    var d = new Date();
    $.ajax({
      url: "LogOn.aspx?rn=" + Math.random().toString().replace(".", "") + "&login=true&cust=" +
                              $("#txtusername").val() +
                              "&pass=" + $("#txtpassword").val() +
                              "&locid=" + $("#txtlocationnum").val() +
                              "&ltype=" + sessionStorage.tmpgroup +
                              "&group=" + $("#txtgroupname").val() +
                              "&remember=" + chk.toString(),
      cache: false,
      dataType: "json",
      success: function (data) {
        //$(".lnkHide").show();
        if (data[0].userauth == "true") {
          var resp = data[0];
          sessionStorage.userauth = resp.userauth;
          sessionStorage.custnum = resp.custnum;
          sessionStorage.location = resp.location;
          sessionStorage.custname = resp.custname;
          sessionStorage.email = resp.custemail;
          sessionStorage.usermode = resp.usermode;
          sessionStorage.cog = '';
          sessionStorage.locationname = resp.locationname;
          sessionStorage.ordid = '';
          sessionStorage.group = resp.group;
          sessionStorage.groupname = resp.groupname;
          $(".spTitle").html(resp.custname + ' ' + sessionStorage.groupname);

          LoadAll();
          $(".lnkHide").show();
          $(".selContact").show();
          app.navigate("#welcome");
        }
        else {
          hideLoad();
          showModalView(data[0].errmess, true);
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Log In: " + err.Message, true);
  }
}

function updatePrefs(e) {

  try { // handless updating the customer profile under the ACCOUNT view

    var li = e.item[0];

    if (e.item[0].id != 'liUpdate') {
      e.preventDefault;
      return;
    }
    e.preventDefault;
    if ($("#txtNotifEmail").val() == "") {
      showModalView("Email Address Is Required..", false);
      return;
    }
    var vld = checkemail($("#txtNotifEmail").val());
    if (!vld) {
      showModalViewInvalid("Invalid Email Address.", false);
      return;
    }
    if ($("#txtAccountPassword").val() == "") {
      showModalView("Password Is Required.", false);
      return;
    }
    var vld = checkPassword($("#txtAccountPassword").val());
    if (!vld) {
      showModalViewInvalid("Invalid Password. Must contain at least 8 characters of which 1 must be a number.", false);
      return;
    }
    if ($("#txtAccountPassword").val() != $("#txtAccountPassword2").val()) {
      showModalViewInvalid("Passwords Do Not Match.", false);
      return;
    }

    showLoad();
    $.ajax({
      url: "Webcontroller.aspx?mn=UpdateCustomerProfile&rn=" + Math.random().toString().replace(".", "") +
              "&email=" + escape($("#txtNotifEmail").val()) +
              "&custname=" + escape($("#txtCustName").val()) +
              "&password=" + escape($("#txtAccountPassword").val()),
      cache: false,
      dataType: "json",
      success: function (data) {

        if (data[0].response == 'true') {
          showModalView("Profile Updated.", false, "Success");
          sessionStorage.custname = $("#txtCustName").val();
          sessionStorage.email = $("#txtNotifEmail").val();
        } else {
          showModalView("Update Failed!", true);
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
    setTimeout(function () {
      hideLoad();
    }, TIME_OUT);
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Update Profile: " + err.Message, true)
  }
}
function deleteOrder(id, locid) {
  try {
    closeModalViewCnfDel();
    id = sessionStorage.delord;
    locid = sessionStorage.delloc;
    sessionStorage.delord = '';
    sessionStorage.delloc = '';
    showLoad();
    $.ajax({
      url: "Webcontroller.aspx?mn=DeleteEZChangeOrder&rn=" + Math.random().toString().replace(".", "") +
              "&ordid=" + id + "&loc=" + locid,
      cache: false,
      dataType: "json",
      success: function (data) {
        if (data[0].response == 'true') {
          //showModalResult("Order Deleted.", false);
        } else {
          showModalResult("Update Failed!", true);
        }
        bindHistory();
        bindOrderCount();
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
    setTimeout(function () {
      hideLoad();
    }, TIME_OUT);
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Delete Order: " + err.Message, true)
  }
  scrollTop();
}

function processQuery(e) {
  try { 
    if (e.item[0].id != 'liContactSubmit') { return; }
    if ($("#txtFrom").val() == "") {
      showModalView("Email Address Is Required.", false);
      return;
    }
    var vld = checkemail($("#txtFrom").val());
    if (!vld) {
      showModalViewInvalid("Email Address Is Not Valid.", false);
      return;
    }
    if (!IsRequired($("#cboSubject"), null, 'combo', 'Subject Is Required')) { return; }
    if ($("#txtNotes").val() == "") {
      showModalView("Comments Are Required.", false);
      return;
    }
    showLoad();
    $.ajax({
      url: "WebController.aspx?mn=SubmitContactForm&rn=" + Math.random().toString().replace(".", "") + "&custnum=" + escape(sessionStorage.custnum) +
                              "&username=" + escape(sessionStorage.custnum) +
                              "&from=" + escape($("#txtFrom").val()) +
                              "&subject=" + escape($("#cboSubject").val()) +
                              "&loc=" + escape($("#selContactUs").val()) +
                              "&comments=" + escape($("#txtNotes").val()),
      cache: false,
      dataType: "json",
      success: function (data) {
        hideLoad();
        if (data[0].response = 'true') {
          showModalViewSent("Comments submitted successfully.", false);
        } else {
          showModalViewSent("Request Failed!.", True);
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Sending of comments failed, please try again.", true);
  }
}
function showOrderPad(e) {
  if (e.item.context.id == 'continue') {
    calcOrder();
    var t = $("#txtTotalOrderRequested").val();
    t = t.toString().replace(/,/g, '');
    t = t.toString().replace('$', '');
    t = parseFloat(t);

    if (!IsRequired($("#ddLocations"), null, 'combo', 'Location Is Required')) { return false; };
    if (!IsRequired($("#dtDeliveryDate"), null, 'date', 'Delivery Date Is Required')) { return false; };
    if ((parseInt(t) <= 0) || (isNaN(parseInt(t)))) {
      showModalView('Total Requested is Required and must be greater than $0.00', false);
      return false;
    }
    try {
      sessionStorage.requested = t;
      $(".spnRequested").html($("#txtTotalOrderRequested").val());
      var loc = escape($("#ddLocations").val());
      var deldate = escape($("#dtDeliveryDate").val());
      var ordid = '&';
      showLoad();
      if (sessionStorage.ordaction == 'edit') {
        ordid = "&orderid=" + sessionStorage.ordid;
      }
      if (sessionStorage.ordaction == 'view') {
        $(".oeitm").addClass("ro");
      }
      else {
        $(".oeitm").removeClass("ro");
      }

      $(".oeitm").removeAttr('readonly');
      $.ajax({
        url: "Webcontroller.aspx?mn=ValidateCustomerAndDate&rn=" + Math.random().toString().replace(".", "") +
              "&loc=" + loc +
              "&deldate=" + deldate + ordid,
        cache: false,
        dataType: "json",
        success: function (data) {

          if (data[0].valid == 'true') {
            $(".ord_tot").show();
            $(".rvword").show();
            app.navigate("#buttongroup-home");
          } else {
            showModalView(data[0].errors, true);
          }
        },
        error: function (e, xhr) {
          handleError(e);
        }
      });
      setTimeout(function () {
        hideLoad();
      }, TIME_OUT);
    }
    catch (err) {
      hideLoad();
      showModalView(err.Message, true)
    }
  }
}

function calcOrder() {
  var fTot = 0;
  var nTot = 0;
  var aTot = 0;
  var cTot = 0;
  var lcTot = 0;
  var vtot = 0;
  $('.fm').each(function (index, obj) {
    if (obj.value != '') {
      fTot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });
  $('.am').each(function (index, obj) {
    if (obj.value != '') {
      aTot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });
  $('.nm').each(function (index, obj) {
    if (obj.value != '') {
      nTot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });
  $('.bc').each(function (index, obj) {
    if (obj.value != '') {
      cTot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });
  $('.lc').each(function (index, obj) {
    if (obj.value != '') {
      lcTot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });

  $('.vmp').each(function (index, obj) {
    if (obj.value != '') {
      vtot += parseFloat(obj.value.replace(/,/g, ''));
    }
  });
  $("#txtVMPTotal").val(vtot);
  $(".fmt").val('$' + (fTot).formatMoney(0, '.', ','));
  $(".amt").val('$' + (aTot).formatMoney(0, '.', ','));
  $(".nmt").val('$' + (nTot).formatMoney(0, '.', ','));
  $(".bct").val('$' + (cTot).formatMoney(2, '.', ','));
  $(".lct").val('$' + (lcTot).formatMoney(0, '.', ','));
  var oTot = fTot + aTot + nTot + cTot + lcTot;
  var oReq = cleanAmount($("#txtTotalOrderRequested").val());

  $(".ordt").val('$' + (parseFloat(oTot)).formatMoney(2, '.', ','));
  $(".spnDifference").html(parseFloat(oTot - oReq).formatMoney(2, '.', ','));
  if (parseFloat(oTot - oReq) == 0) {

    $(".spnDiffLbl").removeClass("footdetred");
    $(".spnDiffLbl").addClass("footdetgreen");
    $(".spnDifference").removeClass("footdetred");
    $(".spnDifference").addClass("footdetgreen");
  }
  else {
    $(".spnDiffLbl").removeClass("footdetgreen");
    $(".spnDiffLbl").addClass("footdetred");
    $(".spnDifference").removeClass("footdetgreen");
    $(".spnDifference").addClass("footdetred");
  }
}
function bindOrderEvents() {
  $('.oe').keydown(function (e) { // prevent the keystrokes we dont want
    var key = e.which;
    switch (key) {
      case 8: // 
      case 9: //
      case 13: // enter
      case 16: //
      case 46: // delete
      case 110: // # pad (.)
      case 190: // (.)
        return true;
        break;
    }

   if (document.getElementById(e.target.id).value.length > 15) { return false; }
    if ((key >= 48) && (key <= 57)) { return true }
    if ((key >= 96) && (key <= 105)) { return true }
    return false;
  });

  $('.oe:not([data-totals])').focus(function (event) {
    // clear the value on focus to mimick placeholder
    if (parseFloat($(this).val()) == 0) {
      $(this).val('');
    }
  });
  $('.oe:not([data-totals])').keyup(function (e) { // calculate the order
    calcOrder();
  });

  $('.oe:not([data-totals])').blur(function (event) {
    if (this.className == 'lc oe') { // loose coin
      if (this.value != '') {
        this.value = (parseFloat(this.value.replace(/,/g, ''))).formatMoney(2, '.', ',');
      } else { this.value = '0'; }
    } else {
      if (this.value != '') {
        this.value = parseFloat(this.value.replace(/,/g, ''));
      } else { this.value = '0'; }
    }
    var bag = false;
    if (this.id == 'txtLC1s') { bag = true }
    if (this.className == 'vmp oe oeitm') { return; }
    validateAmount(this.value, document.getElementById(this.id).getAttribute('data-vld'), bag);
    calcOrder();
  });

  $("#txtTotalOrderRequested").blur(function () {
    this.type = 'text';

    var t = cleanAmount($(this).val());
    if (parseInt(t) > 0) {
      $(this).val('$' + (parseFloat(t)).formatMoney(2, '.', ','));
    } else {
      $(this).val('0.00');
    }

  }).focus(function (event) {
    // clear the value on focus to mimick placeholder
  var val = cleanAmount(this.value);

    this.type = 'number';
    this.step = '0.01';

    if (parseFloat(val) == 0) {
      $(this).val('');
    } else if (parseFloat(val) > 0) {
      this.value = '';
      this.value = val;
    } else {
      this.value = '';
    }
  });
}

function cleanAmount(Amt) {
  var tmpAmt = 0;
  tmpAmt = Amt.toString().replace('$', '');
  tmpAmt = tmpAmt.toLocaleString().replace(/,/g, '');
  tmpAmt = parseFloat(tmpAmt);
  return tmpAmt;
}

function validateAmount(Amount, Denom, Bag) {
  var cb = false;
  var cnb = false;
  if (sessionStorage.currbr == 'Yes') { cb = true; }
  if (sessionStorage.coinbr == 'Yes') { cnb = true; }

  var div;

  switch (Denom) {
    case 'Pennies':
      if (cnb) { div = .50; } else { div = 25; }
      if (Bag) { div = 50; }
      break;
    case 'Nickels':
      if (cnb) { div = 2; } else { div = 100; }
      if (Bag) { div = 200; }
      break;
    case 'Dimes':
      if (cnb) { div = 5; } else { div = 250; }
      if (Bag) { div = 1000; }
      break;
    case 'Quarters':
      if (cnb) { div = 10; } else { div = 500; }
      if (Bag) { div = 1000; }
      break;
    case 'Half Dollars':
      if (cnb) { div = 10; } else { div = 500; }
      if (Bag) { div = 1000; }
      break;
    case 'Dollars':
      if (cnb) { div = 25; } else { div = 1000; }
      if (Bag) { div = 2000; }
      break;
    case 'Ones':
      if (cb) { div = 1; } else { div = 100; }
      break;
    case 'Twos':
      if (cb) { div = 2; } else { div = 200; }
      break;
    case 'Fives':
      if (cb) { div = 5; } else { div = 500; }
      break;
    case 'Tens':
      if (cb) { div = 10; } else { div = 1000; }
      break;
    case 'Twenties':
      if (cb) { div = 20; } else { div = 2000; }
      break;
    case 'Fifties':
      if (cb) { div = 50; } else { div = 5000; }
      break;
    case 'Hundreds':
      if (cb) { div = 100; } else { div = 10000; }
      break;
  }
  if ((parseInt(Amount) == 0) || (Amount == '')) { return; }
  var tmp = parseFloat(Amount) / div;
  var mymod = tmp % 1;
  if (mymod != 0) {
    V_ERROR = true;
    if ((Denom == 'Pennies') && (!Bag)) {
      showModalViewValClient('$' + Amount.toString() + ' in ' + Denom + ' must be in multiples of ' + div, false)
    }
    else {
      showModalViewValClient('$' + Amount.toString() + ' in ' + Denom + ' must be in whole dollars and a multiple of ' + div, false)
    }
  } else { V_ERROR = false }
}

function confirmOrder(e) {
  try {
    e.preventDefault();
    if (!sessionStorage.userauth) {
      if (tabStrip.currentItem().index() > 0) {
        tabStrip.switchTo("#home")
        app.navigate("#login");
      }
      return;
    }
    var ordTotal = $('#ordGrandTotal').val();
    if (parseFloat(ordTotal) <= 0) {
      e.preventDefault();
      showModalView('You must select at least 1 item for this order.', false);
      return;
    }

    var locdesc = sessionStorage.locationname;

    if (sessionStorage.usermode == 1) {
      if ($("#ddLocations")) {
        locdesc = $("#ddLocations")[0][$("#ddLocations")[0].selectedIndex].text;
      }
    }
    var ordTot = $("#ordGrandTotal").val();
    $("#modTitleCnf").text("Order Confirmation");
    $("#modDescCnf").text("Are you sure you want to place an order of " + ordTot + " for this location: " + locdesc + "?");
    $("#modalview-confirm").kendoMobileModalView("open");
  }
  catch (err) {
    hideLoad();
    showModalView("Error trying to process order: " + err.Message, true);
  }
}

function confirmDeleteOrder(ord) {
  try {

    if (!sessionStorage.userauth) {
      if (tabStrip.currentItem().index() > 0) {
        tabStrip.switchTo("#home")
        app.navigate("#login");
      }
      return;
    }
    $("#modTitleCnfDel").text("Confirm Delete");
    $("#modDescCnfDel").text("Are you sure you want to DELETE Order: " + ord + "?");
    $("#modalview-confirm-delete").kendoMobileModalView("open");
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Delete order: " + err.Message, true);
  }
}

function showSummary() {
  try {
    if (sessionStorage.ordnotes == 'undefined') { sessionStorage.ordnotes = ''; }
    var ul = $("#liOrderConfirm2");
    $('.cnf').remove();

    ul.before('<li class="ordSectItm cnf">Location: ' + $(".spnLocationName").html() + '</li>');
    var i = 0;
    $('.oeitm').each(function () {
      //
      if ((parseInt(this.value) != '0') && (this.value != '')) {
        if (this.className == "vmp oe oeitm") {
          ul.before('<li class="ordSectItm cnf">' + document.getElementById(this.id).getAttribute('data-desc') + '<input type="text" class="osm ro" style="text-align:right !important" readonly="readonly" value="' + this.value + '" /></li>');
        } else {
          ul.before('<li class="ordSectItm cnf">' + document.getElementById(this.id).getAttribute('data-desc') + '<input type="text" class="osm ro" style="text-align:right !important" readonly="readonly" value="$' + (parseFloat(this.value)).formatMoney('2', '.', ',') + '" /></li>');
        }
      }
    });
    ul.before('<li style="color:Red;" class="ordSectItm cnf">Order Grand Total:<input type="text" class="osm oe" style="text-align:right !important; color:Red" placeholder="0" tabindex="-1"  readonly="readonly" value="' + $("#ordGrandTotal").val() + '"></li>')
    ul.before('<li class="ordSectItm cnf"><textarea id="txtOrderNotes" placeholder="Enter Order Notes" style="width:100%; rows="3" cols="1">' + sessionStorage.ordnotes + '</textarea></li>')
    $("#dtSummaryDeliveryDate").val($("#dtDeliveryDate").val());
    app.navigate("#divOrderSummary");
    scrollTop();
    $(".ord_tot_confirm").show();
  }
  catch (err) {}
}

function cancelOrder(e) {

  if (sessionStorage.ordaction != '') {
    app.navigate("#orderPendingList");
    return;
  }
  clearPrevOrder();
  try {
    $("#ddLocations")[0].selectedIndex = 0;
    $("#dtDeliveryDate")[0].selectedIndex = 0;
    $("#txtTotalOrderRequested").val('0');
    $(".ord_tot").hide();
    app.navigate("#orders");
  }
  catch (err) {
    showModalView("Cannot Cancel Order: " + err.Message, true);
  }
}

function processConfimOrder(e) {
  try {
    showLoad();
    var loc = escape($("#ddLocations").val());
    var deldate = escape($("#dtSummaryDeliveryDate").val());
    var notes = escape($("#txtOrderNotes").val());
    var Itms = '';
    $(".oe").each(function (index, obj) {
      Itms += '&' + obj.id + '=' + obj.value.replace(/,/g, '').replace('$', '');
    });

    Itms += '&ordGrandTotal=' + $("#ordGrandTotal").val().replace(/,/g, '').replace('$', '')
    var tmp = "";
    var URL = "WebController.aspx?mn=PlaceOrder&rn=" + Math.random().toString().replace(".", "")
                                                      + "&loc=" + loc
                                                      + "&deldate=" + deldate
                                                      + "&branch=" + sessionStorage.branch
                                                      + "&notes=" + notes
                                                      + Itms;
    if (sessionStorage.ordid != '') {
      URL += "&orderid=" + sessionStorage.ordid;
    }

    $.ajax({
      url: URL,
      cache: false,
      dataType: "json",
      success: function (data) {
        if (data[0].ordersuccess == "true") {
          $('.cnf').remove();
          var ord = data[0].ezordernum;
          $(".ordt").val("0");
          hideLoad();
          resetOrder();
          var s = "Order Confirmation #: " + ord;
          var edit = false;
          if (data[0].action == "edit") {
            s = "Order " + ord + " Updated";
            edit = true;
          }
          clearPrevOrder();
          $("#ddLocations")[0].selectedIndex = 0;
          $("#dtDeliveryDate")[0].selectedIndex = 0;
          $("#txtTotalOrderRequested").val('0');
          showModalConfirmed(s, false);
          scrollTop();
          if (edit) {
            app.navigate("#orderPendingList");
          }
          else {
            app.navigate("#orders");
          }
          scrollTop();
          bindOrderCount();
        }
        else {
          hideLoad();
          showModalView("Order failed: " + data[0].error, true);
          if (data[0].error.toString().toLowerCase().indexOf("session") >= 0)
            if (tabStrip.currentItem().index() > 0) {
              tabStrip.switchTo("#home")
              app.navigate("#login");
            }
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Process Order: " + err.Message, true);
  }
}

function validateConfirmOrder(e) {
  try {
    e.preventDefault();
    if (sessionStorage.ordaction == 'view') {
      return;
    }
    var ordTotal = $('#ordGrandTotal').val();
    if (parseFloat(ordTotal) <= 0) {
      e.preventDefault();
      showModalView('You must select at least 1 item for this order.', false);
      return;
    }
    var ordReq = $('#txtTotalOrderRequested').val();
    var tot = cleanAmount(ordTotal);
    var req = cleanAmount(ordReq);

    if (tot != req) {
      e.preventDefault();
      showModalViewInvalid('The Currency/Coin amounts do not equal your total order amount.', false);
      return;
    }
    showLoad();
    var loc = escape($("#ddLocations").val());
    var deldate = ($("#dtDeliveryDate").val());
    if (sessionStorage.ordaction == 'edit') {
      deldate = $("#dtSummaryDeliveryDate").val();
    }

    var Itms = '';
    $(".oe").each(function (index, obj) {
      Itms += '&' + obj.id + '=' + obj.value.replace(/,/g, '').replace('$', '');
    });

    Itms += '&ordGrandTotal=' + $("#ordGrandTotal").val().replace(/,/g, '').replace('$', '')

    var tmp = "";
    var URL = "WebController.aspx?mn=PlaceOrder&validateonly=true&rn=" + Math.random().toString().replace(".", "") + "&loc=" + loc + '&deldate=' + deldate + Itms;
    if (sessionStorage.ordid != '') {
      URL += "&orderid=" + sessionStorage.ordid.toString();
    }
    showConfirmTotal = true;
    $.ajax({
      url: URL,
      cache: false,
      dataType: "json",
      success: function (data) {
        if (data[0].valid == "true") {
          hideLoad();
          showSummary();
        }
        else {
          hideLoad();
          var err = data[0].error;

          showModalViewVal(err, true);
          if (data[0].error.toString().toLowerCase().indexOf("session") >= 0)
            if (tabStrip.currentItem().index() > 0) {
              tabStrip.switchTo("#home")
              app.navigate("#login");
            }
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Validate Order: " + err.Message, true);
  }
}

function validateTab(prevTab, newTab) {
  try {
    showLoad();
    var loc = escape($("#ddLocations").val());
    var deldate = ($("#dtDeliveryDate").val());

    if (sessionStorage.ordaction == 'edit') {
      deldate = $("#dtSummaryDeliveryDate").val();
    }

    var Itms = '';
    $(".oe").each(function (index, obj) {
      Itms += '&' + obj.id + '=' + obj.value.replace(/,/g, '').replace('$', '');
    });

    Itms += '&ordGrandTotal=' + $("#ordGrandTotal").val().replace(/,/g, '').replace('$', '')

    var tmp = "";
    var URL = "WebController.aspx?mn=PlaceOrder&validateonly=true&rn=" + Math.random().toString().replace(".", "") + "&loc=" + loc + '&deldate=' + deldate + Itms;
    if (sessionStorage.ordid != '') {
      URL += "&orderid=" + sessionStorage.ordid.toString();
    }
    showConfirmTotal = true;
    $.ajax({
      url: URL,
      cache: false,
      dataType: "json",
      success: function (data) {
        if (data[0].valid == "true") {
          hideLoad();
        }
        else {
          hideLoad();
          showModalConfirmed("Order failed: " + data[0].error, true);

          var buttongroup = $("#order-pad").data("kendoMobileButtonGroup")
          buttongroup.select(prevTab);
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Validate Order: " + err.Message, true);
  }
}

function forgotPassword(e) {
  try {
    if (e.item[0].id != 'lnkSubmitEmail') { return; }
    e.preventDefault();

    if (!IsRequired($("#txtCustomerNum"), null, 'text', 'Customer # Is Required')) { return false; };
    if (!IsRequired($("#txtInvoiceNum"), null, 'text', 'Invoice # Is Required')) { return false; };
    showLoad();
    var cust = escape($("#txtCustomerNum").val());
    var inv = escape($("#txtInvoiceNum").val());
    var URL = "WebController.aspx?mn=GetInvoiceCount&rn=" + Math.random().toString().replace(".", "") + "&cust=" + cust + '&inv=' + inv;

    $.ajax({
      url: URL,
      cache: false,
      dataType: "json",
      success: function (data) {
        hideLoad();
        if (data[0].emailsent == "true") {
          showModalResult(data[0].mess, false);
          $("#txtCustomerNum").val('');
          $("#txtInvoiceNum").val('');
          app.navigate("#home");
        }
        else {
          showModalResult(data[0].mess, true);
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
  }
  catch (err) {
    hideLoad();
    showModalView("Cannot Send Email: " + err.Message, true);
  }
}

function resetPrefs() {
  $("#txtCustName").val(sessionStorage.custname);
  $("#txtNotifEmail").val(sessionStorage.email);
}
function LoadAll() {
  $("#txtFrom").val(sessionStorage.email.toString().toLowerCase());
  resetPrefs();
  $("#txtAccountPassword").val($("#txtpassword").val());
  bindLocations();
  hideLoad();
}
function resetDates() {
  var now = new Date();
  var month = (now.getMonth() + 1);
  var day = now.getDate();
  if (month < 10)
    month = "0" + month;
  if (day < 10)
    day = "0" + day;
  var today = now.getFullYear() + '-' + month + '-' + day;
  $('.dtDate').val(today);
}
function onLocChange() {
  try {

    var template = kendo.template($("#locTemplate").html());
    $(".ddLoc").html(kendo.render(template, this.view()));
    var loc = document.location.href.split("#");
    var sLoc = "welcome";
    // handle the browser refresh which may leave an empty view.
    if (loc.length > 1) {
      switch (loc[1]) {
        case "orderhistorydetail":
          sLoc = "status"
          break;
        case "login":
          break;
        default:
          sLoc = loc[1];
      }
    }

    app.navigate("#" + sLoc);
    hideLoad();
  } catch (err) {
    showModalView("Cannot Choose Location: " + err.Message, true);
  }
}
function bindLocations() {
  try {
    if (sessionStorage.usermode == 2) {
      $('.ddLoc')
        .find('option')
        .remove()
        .end()
        .append('<option value="' + sessionStorage.location + '">' + sessionStorage.locationname + '</option>');
      bindLocationTemplate();
      bindHistory();
      bindPendingOrdersRPT();
      //app.navigate("#welcome");
      return;
    }
    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          type: "POST",
          dataType: "xml",
          url: "WebController.aspx?mn=GetOrderLocations"
          //,data: ""
        }
      },
      schema: {
        type: "xml",
        data: "/locations/location",
        model: {
          fields: {
            id: "id/text()",
            name: "name/text()"
          }
        }
      },
      change: onLocChange,
      error: function (e) {
        // handleError("Error Occurred: " + e.xhr.responseText);
        handleError(e);
      }
    });
    dataSource.read();
  } catch (err) {
    hideLoad();
    showModalView("Cannot Load Locations: " + err.Message, true);
  }
}
function bindLocationTemplate() {
  try {
    showLoad();
    bindOrderCount();
    var loc = $("#ddLocations").val();
    if (sessionStorage.usermode == 2) {
      loc = sessionStorage.location;
    }
    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          type: "POST",
          dataType: "xml",
          url: "WebController.aspx?mn=GetLocationProfile&loc=" + loc
        }
      },
      schema: {
        type: "xml",
        data: "/locationProfile",
        model: {
          fields: {
            ServiceDays: "ServiceDays/text()",
            Cutoff: "CutOff/text()",
            Status: "Status/text()",
            Type: "Type/text()",
            COD: "COD/text()",
            CoinBreak: "CoinBreak/text()",
            CurrencyBreak: "CurrencyBreak/text()",
            OrderLimit: "OrderLimit/text()",
            ActiveOrder: "ActiveOrder/text()",
            SOAllowed: "SOAllowed/text()",
            SO_Group: "SOGroup/text()",
            COG: "COG/text()",
            Veritrak: "Veritrak/text()",
            VMP: "VMP/text()",
            Branch: "Branch/text()"
          }
        }
      },
      change: onLocTempChange,
      error: function (e) {

        //handleError("Error Occurred: " + e.xhr.responseText);
        handleError(e);
      }
    });
    orderTemplate = dataSource;
    dataSource.read();

  } catch (err) {
    showModalView("Cannt Load Location Profile: " + err.Message, true);
    hideLoad();
  }
}

function onLocTempChange() {
  try { // fires when kendo datasource is data-bound
    $("#svcLocationProfile").css("display", "");
    var ds = this.view()[0];
    $("#pflServiceDays").val(ds.ServiceDays).attr('readonly', true);
    $("#pflCutoff").val(ds.Cutoff).attr('readonly', true);
    $("#pflStatus").val(ds.Status).attr('readonly', true);
    $("#pflType").val(ds.Type).attr('readonly', true);
    $("#pflCOD").val(ds.COD).attr('readonly', true);
    $("#pflCoinBreak").val(ds.CoinBreak).attr('readonly', true);
    $("#pflCurrencyBreak").val(ds.CurrencyBreak).attr('readonly', true);
    sessionStorage.cog = ds.COG;
    sessionStorage.Veritrak = ds.Veritrak;
    sessionStorage.Restricted = ds.Type;
    sessionStorage.vmp = ds.VMP;
    sessionStorage.branch = ds.Branch;
    sessionStorage.currbr = ds.CurrencyBreak;
    sessionStorage.coinbr = ds.CoinBreak;

    $(".spnLocationName").html($("#ddLocations")[0][$("#ddLocations")[0].selectedIndex].text);

    var strVal = '$' + parseInt(ds.OrderLimit).formatMoney(2, '.', ',');
    if (ds.OrderLimit == 'No Limit') {
      strVal = ds.OrderLimit;
    }
    $("#pflOrderLimit").val(strVal).attr('readonly', true);
    strVal = parseInt(ds.ActiveOrder).formatMoney(2, '.', ',');
    $("#pflActiveOrder").val('$' + strVal).attr('readonly', true);
    $(".ordSectItm").show();
    // filter by the change order group
    bindChangeOrderGroup();

    hideLoad();
  } catch (err) {
    hideLoad();
  }
}

function bindChangeOrderGroup() {
  try {
    showLoad();
    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          type: "POST",
          dataType: "xml",
          url: "WebController.aspx?mn=GetChangeOrderGroup&groupid=" + sessionStorage.cog
        }
      },
      schema: {
        type: "xml",
        data: "/locationProfile",
        model: {
          fields: {
            COG_Curr_Hundreds: "COG_Curr_Hundreds/text()",
            COG_Curr_Fifties: "COG_Curr_Fifties/text()",
            COG_Curr_Twenties: "COG_Curr_Twenties/text()",
            COG_Curr_Tens: "COG_Curr_Tens/text()",
            COG_Curr_Fives: "COG_Curr_Fives/text()",
            COG_Curr_Twos: "COG_Curr_Twos/text()",
            COG_Curr_Ones: "COG_Curr_Ones/text()",
            COG_Curr_ATM_Hundreds: "COG_Curr_ATM_Hundreds/text()",
            COG_Curr_ATM_Fifties: "COG_Curr_ATM_Fifties/text()",
            COG_Curr_ATM_Twenties: "COG_Curr_ATM_Twenties/text()",
            COG_Curr_ATM_Tens: "COG_Curr_ATM_Tens/text()",
            COG_Curr_ATM_Fives: "COG_Curr_ATM_Fives/text()",
            COG_Curr_ATM_Twos: "COG_Curr_ATM_Twos/text()",
            COG_Curr_ATM_Ones: "COG_Curr_ATM_Ones/text()",
            COG_Curr_NEW_Hundreds: "COG_Curr_NEW_Hundreds/text()",
            COG_Curr_NEW_Fifties: "COG_Curr_NEW_Fifties/text()",
            COG_Curr_NEW_Twenties: "COG_Curr_NEW_Twenties/text()",
            COG_Curr_NEW_Tens: "COG_Curr_NEW_Tens/text()",
            COG_Curr_NEW_Fives: "COG_Curr_NEW_Fives/text()",
            COG_Curr_NEW_Twos: "COG_Curr_NEW_Twos/text()",
            COG_Curr_NEW_Ones: "COG_Curr_NEW_Ones/text()",
            COG_Coin_Dollars: "COG_Coin_Dollars/text()",
            COG_Coin_Halves: "COG_Coin_Halves/text()",
            COG_Coin_Quarters: "COG_Coin_Quarters/text()",
            COG_Coin_Dimes: "COG_Coin_Dimes/text()",
            COG_Coin_Nickels: "COG_Coin_Nickels/text()",
            COG_Coin_Pennies: "COG_Coin_Pennies/text()",
            COG_Coin_Loose_Dollars: "COG_Coin_Loose_Dollars/text()",
            COG_Coin_Loose_Halves: "COG_Coin_Loose_Halves/text()",
            COG_Coin_Loose_Quarters: "COG_Coin_Loose_Quarters/text()",
            COG_Coin_Loose_Dimes: "COG_Coin_Loose_Dimes/text()",
            COG_Coin_Loose_Nickels: "COG_Coin_Loose_Nickels/text()",
            COG_Coin_Loose_Pennies: "COG_Coin_Loose_Pennies/text()"
          }
        }
      },
      change: onCOGBound,
      error: function (e) {
        handleError(e);
      }
    });
    orderTemplate = dataSource;
    dataSource.read();
  } catch (err) {
    showModalView("Cannot Load Location Profile: " + err.Message, true);
    hideLoad();
  }
}

function onCOGBound() {
  try {
    $(".ordSectItem").show();
    $(".unavail").hide();
    var ds = this.view()[0];
    var bF = false;
    var bA = false;
    var bN = false;
    var bC = false;
    var bLC = false;

    // restricted users cannot order denominations over $5 and 25cents respectively.
    // veritrak users are the only users allowed to order NEW money.

    var bRst = ((sessionStorage.Restricted == 'Restricted') ? true : false);
    var bVT = ((sessionStorage.Veritrak == 'Y') ? true : false);

    if ((ds.COG_Curr_Hundreds == 'Y') && (!bRst)) { bF = true; } else { $("#liF100s").hide(); }
    if ((ds.COG_Curr_Fifties == 'Y') && (!bRst)) { bF = true; } else { $("#liF50s").hide(); }
    if ((ds.COG_Curr_Twenties == 'Y') && (!bRst)) { bF = true; } else { $("#liF20s").hide(); }
    if ((ds.COG_Curr_Tens == 'Y') && (!bRst)) { bF = true; } else { $("#liF10s").hide(); }
    if (ds.COG_Curr_Fives == 'Y') { bF = true; } else { $("#liF5s").hide(); }
    if (ds.COG_Curr_Twos == 'Y') { bF = true; } else { $("#liF2s").hide(); }
    if (ds.COG_Curr_Ones == 'Y') { bF = true; } else { $("#liF1s").hide(); }
    if (!bF) {
      $("#unFIT").show();
    }
    if ((ds.COG_Curr_ATM_Hundreds == 'Y') && (!bRst)) { bA = true; } else { $("#liA100s").hide(); }
    if ((ds.COG_Curr_ATM_Fifties == 'Y') && (!bRst)) { bA = true; } else { $("#liA50s").hide(); }
    if ((ds.COG_Curr_ATM_Twenties == 'Y') && (!bRst)) { bA = true; } else { $("#liA20s").hide(); }
    if ((ds.COG_Curr_ATM_Tens == 'Y') && (!bRst)) { bA = true; } else { $("#liA10s").hide(); }
    if ((ds.COG_Curr_ATM_Fives == 'Y') && (!bRst)) { bA = true; } else { $("#liA5s").hide(); }
    if ((ds.COG_Curr_ATM_Twos == 'Y') && (!bRst)) { bA = true; } else { $("#liA2s").hide(); }
    if ((ds.COG_Curr_ATM_Ones == 'Y') && (!bRst)) { bA = true; } else { $("#liA1s").hide(); }
    if (!bA) {
      $("#unATM").show();
    }
    if ((ds.COG_Curr_NEW_Hundreds == 'Y') && (!bRst)) { bN = true } else { $("#liN100s").hide(); }
    if ((ds.COG_Curr_NEW_Fifties == 'Y') && (!bRst)) { bN = true } else { $("#liN50s").hide(); }
    if ((ds.COG_Curr_NEW_Twenties == 'Y') && (!bRst)) { bN = true } else { $("#liN20s").hide(); }
    if ((ds.COG_Curr_NEW_Tens == 'Y') && (!bRst)) { bN = true } else { $("#liN10s").hide(); }
    if (ds.COG_Curr_NEW_Fives == 'Y') { bN = true } else { $("#liN5s").hide(); }
    if (ds.COG_Curr_NEW_Twos == 'Y') { bN = true } else { $("#liN2s").hide(); }
    if (ds.COG_Curr_NEW_Ones == 'Y') { bN = true } else { $("#liN1s").hide(); }
    if (!bVT) { // override the COG
      bN = false;
      $(".vts").hide();
    }
    if (!bN) {
      $("#unNEW").show();
    }
    if ((ds.COG_Coin_Dollars == 'Y') && (!bRst)) { bC = true } else { $("#liC100s").hide(); }
    if ((ds.COG_Coin_Halves == 'Y') && (!bRst)) { bC = true } else { $("#liC50s").hide(); }
    if (ds.COG_Coin_Quarters == 'Y') { bC = true } else { $("#liC25s").hide(); }
    if (ds.COG_Coin_Dimes == 'Y') { bC = true } else { $("#liC10s").hide(); }
    if (ds.COG_Coin_Nickels == 'Y') { bC = true } else { $("#liC5s").hide(); }
    if (ds.COG_Coin_Pennies == 'Y') { bC = true } else { $("#liC1s").hide(); }
    if (!bC) {
      $("#unBOX").show();
    }
    if ((ds.COG_Coin_Loose_Dollars == 'Y') && (!bRst)) { bLC = true } else { $("#liLC100s").hide(); }
    if ((ds.COG_Coin_Loose_Halves == 'Y') && (!bRst)) { bLC = true } else { $("#liLC50s").hide(); }
    if (ds.COG_Coin_Loose_Quarters == 'Y') { bLC = true } else { $("#liLC25s").hide(); }
    if (ds.COG_Coin_Loose_Dimes == 'Y') { bLC = true } else { $("#liLC10s").hide(); }
    if (ds.COG_Coin_Loose_Nickels == 'Y') { bLC = true } else { $("#liLC5s").hide(); }
    if (ds.COG_Coin_Loose_Pennies == 'Y') { bLC = true } else { $("#liLC1s").hide(); }
    if (!bLC) {
      $("#unBAG").show();
    }
    if (sessionStorage.vmp != 'Y') {
      $(".livmp").hide();
      $("#unVMP").show();
    }
    // filter by the change order group
  } catch (err) { }
  hideLoad();
}
function bindOrderCount() {
  try {
    
    if (sessionStorage.usermode == 1) { return; } // no need to bind this for corporate logins

    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          type: "POST",
          dataType: "xml",
          url: "WebController.aspx?mn=GetOrderCount&loc=" + $("#ddLocations").val()
        }
      },
      schema: {
        type: "xml",
        data: "/orders",
        model: {
          fields: {
            ordcount: "count/text()"
          }
        }
      },
      change: onCountBound,
      error: function (e) {
        //handleError("Error Occurred: " + e.xhr.responseText);
        handleError(e);
      }
    });
    //orderTemplate = dataSource;
    dataSource.read();
  } catch (err) {
    showModalView("Cannot Load Location Profile: " + err.Message, true);
    hideLoad();
  }
}
function onCountBound() {
  try {
    var ds = this.view()[0];
    var oc = parseInt(ds.ordcount);
    if (oc > 0) {
      tabStrip.badge(1, oc);
    } else {
      tabStrip.badge(1, false);
    }
  } catch (err) { }
  hideLoad();
}
function handleError(e) {
  var mess

  if (e.xhr == undefined) {
    mess = "Error Occurred: " + e.responseText;
  } else {
    mess = "Error Occurred: " + e.xhr.responseText;
  }

  hideLoad();
  switch (mess) {
    case "Error Occurred: Session Expired":
      clearAll();
      $(".lnkHide").hide();
      sessionStorage.clear();
      showModalViewSessExp();
      break;
    case "Error Occurred: Order Error":
      // only use this case for history errors 
      showModalView("Unable to process order at this time.", true);
      bindHistory();
      break;
    default:
      clearAll();
      $(".lnkHide").hide();
      sessionStorage.clear();
      $("#spnLogOutError").html('Unknown Error Has Occurred.  You must log back into the application.');
      showModalView("Unknown Error has occurred: " & mess, true);
  }
  hideLoad();
}

function validateSessionAndCookie() {
  try {
    var bValid = false;
    $.ajax({
      url: "LogOn.aspx?rn=" + Math.random().toString().replace(".", "") + "&validate=true",
      cache: false,
      dataType: "json",
      success: function (data) {
        au = true;
        if (data[0].userauth == "false") {
          clearAll();
          $(".lnkHide").hide();
          tm = $.now();
          if (tabStrip.currentItem().index() > 0) {
            tabStrip.switchTo("#home")
            app.navigate("#login");
          } else {
          }
        }
        else {
          $(".lnkHide").show();
          bValid = true;
        }
      },
      error: function (e, xhr) {
        handleError(e);
      }
    });
    setTimeout(function () {
      hideLoad();
    }, TIME_OUT);
    return bValid;
  }
  catch (err) {
    showModalView("Cannot Validate Session: " + err.Message, true);
  }
}
function initDD(e) {
  try {
    var body = $(".km-vertical,.km-horizontal");
    if (kendo.ui.DropDownList) {
      $(".ddLoc").kendoDropDownList({
        popup: { appendTo: body },
        animation: { open: { effects: body.hasClass("km-android") ? "fadeIn" : body.hasClass("km-ios") ? "slideIn:up" : undefined} }
      });
    }
  }
  catch (err) {
    showModalView("Cannot Load locations: " + err.Message, true);
  }
}
function setLoginPref(e) {
  try {
    var chkd = false;
    if (getCookie("UserRemember") == "true") {
      chkd = true;
      $("#txtusername").val(getCookie("UserAuth"));
      $("#txtpassword").val('');
    } else {
      $("#txtusername").val('');
      $("#txtpassword").val('');
    }
    $("#chkremember").kendoMobileSwitch({ offLabel: "No", onLabel: "Yes", checked: chkd });
    $("#chkTerms").kendoMobileSwitch({ offLabel: "No", onLabel: "Yes", checked: false });
    $("#chkGroup").kendoMobileSwitch({ offLabel: "No", onLabel: "Yes", checked: false });

    $("#chkGroup").data("kendoMobileSwitch").bind("change", function (e) {
      if (e.checked) {
        sessionStorage.tmpgroup = true;
        $("#txtgroupname").val('').show();
        $("#txtlocationnum").val('').hide();
      } else {
        sessionStorage.tmpgroup = false;
        $("#txtgroupname").val('').hide();
        $("#txtlocationnum").val('').show();
      }
    });


  } catch (err) {
    showModalView("Cannot Load Preferences: " + err.Message, true);
  }
}
function home_onShow(args) {
  setTimeout(function () {
    hideLoad();
  }, TIME_OUT);
};
function IsRequired(s1, s2, t, d) {
  switch (t) {
    case 'combo':
      if ((s1.val() == 'undefined') || (s1.val() == '')) { showModalView(d, false); return false; }
      break;
    case 'date':
      if (s1.val() == '') { showModalView(d, false); return false; }
      if (!s2) { return true; }
      if (s2.val() == '') { showModalView('Ending Date is Required', false); return false; }
      var dt1 = new Date(s1.val());
      var dt2 = new Date(s2.val());
      if (dt1 > dt2) { showModalView('Ending Date is before Starting Date', false); return false; }
      break;
    case 'text':
      if (s1.val() == '') { showModalView(d, false); return false; }
      break;

    default:
      if (t == '') { showModalView('Value Is Required', false); return false; }
  }
  return true;
}
function showLoad() {
  try {
    app.showLoading();
    app.view().loader.transition();
  } catch (err) {
    app.view().loader.transitionDone();
    showModalView("Cannot Process Animations: " + err.Message, true);
  }
}
function hideLoad() {
  try {
    app.hideLoading();
    app.view().loader.transitionDone();
  } catch (err) {
    app.view().loader.transitionDone();
    showModalView("Cannot Process Animations: " + err.Message, true);
  }
}

function onBeforeShowFP(e) {
  $("#txtCustomerNum").val('');
  $("#txtInvoiceNum").val('');
}

function onBeforeShowCT(e) {
  $("#txtNotes").text('');
}

function onBeforeShowView(e) {
  try {

    if ((sessionStorage.usermode == 2) && (e.view.id == '#orders')) {
      $("#svcLocationProfile").show();
    }
    else {
      if ($("#ddLocations")[0].selectedIndex == 0) {
        $("#svcLocationProfile").hide();
      }
    }
    if (GOBACK) {
      if (e.view.id == '#divOrderSummary') {
        e.preventDefault();
        app.navigate("#welcome");
        return;
      }
    }
    GOBACK = false;
    if (!showTotal) {
      if (e.view.id == '#buttongroup-home') {
        $(".ord_tot").show();
        $(".ord_tot_confirm").hide();
      } else {
        $(".ord_tot").hide();
        $(".ord_tot_confirm").hide();

        if (showConfirmTotal) {
          $(".ord_tot").show();
          $(".ord_tot_review").hide();
          $(".ord_tot_confirm").show();
        }

        $("#ddLocHistory")[0].selectedIndex = 0;
        if (sessionStorage.usermode == 1) {
          $(".histline").remove();
        }
      }
    }
    if (sessionStorage.ordaction == 'view') {
      $(".ord_tot_review").hide();
      $(".ord_tot_confirm").hide();
    }
    showTotal = false;
    showConfirmTotal = false;

    if (!sessionStorage.userauth) {
      showModalView("Session Expired!", true);
      document.location.href = "home.aspx#login";
    }
    scrollTop();
  } catch (err) {
    showModalView("Error trying to load menus: " + err.Message, true);
  }
}
function onShowView(e) {
  scrollTop();
}
function clearAll() {
  try {
    resetOrder(null);
    sessionStorage.clear();
    tabStrip.badge(1, false);
    $(".spTitle").html('');
    $("#txtpassword").val('');
    $(".ddLoc").html("");
    $(".histDetail").html("");
    $(".selContact").hide();
    $("#nestedListView").kendoMobileListView({
      dataSource: null,
      template: kendo.template($("#templEmpty").html())
    });
  } catch (err) {
    showModalView("Error: " + err.Message, true);
  }
}
function resetTemp(e) {
  try {
    $(".histline").remove();
    $(".histDetail").html("");
    $(".histDetail").text("");
    $(".ordOpts").css("visibility", "hidden");
    scrollTop();
  } catch (err) {
    showModalView(err.Message, true);
  }
}
function prepTemplate(e) {
  try {

    e.preventDefault();
    $("#dtDeliveryDate").val('');

    setTimeout(function () {
      switch (e.item[0].id) {
        case "liPackrules":
          app.navigate("#packrules");
          break;
        case "liViewCurrentOrders":
          if (sessionStorage.usermode == 1) {
            $(".histline").remove();

          } else {
            bindHistory();
          }
          app.navigate("#orderPendingList");
          break;
        case "liSingleOrder":
          clearPrevOrder();

          if (e.target[0].hash == '#buttongroup-home') {
            showTotal = true;
            $(".ord_tot").show();
          }

          var stat = e.item[0].innerText;

          if (stat.indexOf("Order Status") >= 0) {
            return;
          }
          if (sessionStorage.usermode == 1) {
            resetTemp(null);
            resetOrder(null);
          } else {
            bindLocationTemplate();
            $("#svcLocationProfile").show();
          }
          app.navigate("#orders");
          scrollTop();
          break;
      }
    }, TIME_OUT);

  } catch (err) {
    showModalView(err.Message, true);
  }

}
function resetOrder(e) {
  try {

    clearPrevOrder();

    if (sessionStorage.usermode == 2) {
      //app.navigate("#welcome");
    } else {
      var dd = $("#ddLocations");
      if (dd.length > 0) {
        dd[0].selectedIndex = 0;
      }
    }

  } catch (err) {
    showModalView(err.Message, true);
  }
  scrollTop();
}

function clearPrevOrder() {
  try {
    $('.cnf').remove();
    $(".oe").val("0");
    $(".ordt").val("0");

    sessionStorage.ordid = '';
    sessionStorage.ordaction = '';
    sessionStorage.ordnotes = '';
    sessionStorage.requested = 0;
    $("#txtTotalOrderRequested").val('0.00');
    $("#txtVMPTotal").val('0');
    $(".fmt").val('$' + (parseInt(0)).formatMoney(0, '.', ','));
    $(".amt").val('$' + (parseInt(0)).formatMoney(0, '.', ','));
    $(".nmt").val('$' + (parseInt(0)).formatMoney(0, '.', ','));
    $(".bct").val('$' + (parseInt(0)).formatMoney(0, '.', ','));
    $(".lct").val('$' + (parseInt(0)).formatMoney(0, '.', ','));
    $(".ordt").val('$' + (parseInt(0)).formatMoney(2, '.', ','));


  }
  catch (err) {
    //alert(err.Message);
  }
}

function scrollTop() {
  try {
    if (app.scroller()) {
      app.scroller().reset();
    }
  }
  catch (err) { }
}


function clearOrder() {
  try {
    if (sessionStorage.usermode == 2) {
      app.navigate("#welcome");
    } else {
      $(".nestedListView").html('').css("visibility", "hidden");
      $(".ordOpts").remove();
      $("#tblBtnOrder").hide();
      var dd = $('#ddLocations');
      if (dd.length > 0) {
        dd[0].selectedIndex = 0;
      }
    }
  } catch (err) {
    showModalView(err.Message, true);
  }
}


// ** EDIT EXISTING ORDER FUNCTIONS  ** //
var bReadonly = false;
function bindEZChangeOrder(id, readonly) {

  try { // edit order
    bReadonly = readonly;
    showLoad();

    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          type: "POST",
          dataType: "xml",
          url: "WebController.aspx?mn=GetEZChangeOrder&orderid=" + id
        }
      },
      schema: {
        type: "xml",
        data: "/order",
        model: {
          fields: {
            EZO_ID: "EZO_ID/text()",
            EZO_Delivery_Date: "EZO_Delivery_Date/text()",
            EZO_Curr_Hundreds: "EZO_Curr_Hundreds/text()",
            EZO_Curr_Fifties: "EZO_Curr_Fifties/text()",
            EZO_Curr_Twenties: "EZO_Curr_Twenties/text()",
            EZO_Curr_Tens: "EZO_Curr_Tens/text()",
            EZO_Curr_Fives: "EZO_Curr_Fives/text()",
            EZO_Curr_Twos: "EZO_Curr_Twos/text()",
            EZO_Curr_Ones: "EZO_Curr_Ones/text()",
            EZO_Curr_Total: "EZO_Curr_Total/text()",
            EZO_Curr_ATM_Hundreds: "EZO_Curr_ATM_Hundreds/text()",
            EZO_Curr_ATM_Fifties: "EZO_Curr_ATM_Fifties/text()",
            EZO_Curr_ATM_Twenties: "EZO_Curr_ATM_Twenties/text()",
            EZO_Curr_ATM_Tens: "EZO_Curr_ATM_Tens/text()",
            EZO_Curr_ATM_Fives: "EZO_Curr_ATM_Fives/text()",
            EZO_Curr_ATM_Twos: "EZO_Curr_ATM_Twos/text()",
            EZO_Curr_ATM_Ones: "EZO_Curr_ATM_Ones/text()",
            EZO_Curr_ATM_Total: "EZO_Curr_ATM_Total/text()",
            EZO_Curr_NEW_Hundreds: "EZO_Curr_NEW_Hundreds/text()",
            EZO_Curr_NEW_Fifties: "EZO_Curr_NEW_Fifties/text()",
            EZO_Curr_NEW_Twenties: "EZO_Curr_NEW_Twenties/text()",
            EZO_Curr_NEW_Tens: "EZO_Curr_NEW_Tens/text()",
            EZO_Curr_NEW_Fives: "EZO_Curr_NEW_Fives/text()",
            EZO_Curr_NEW_Twos: "EZO_Curr_NEW_Twos/text()",
            EZO_Curr_NEW_Ones: "EZO_Curr_NEW_Ones/text()",
            EZO_Curr_NEW_Total: "EZO_Curr_NEW_Total/text()",
            EZO_Coin_Dollars: "EZO_Coin_Dollars/text()",
            EZO_Coin_Halves: "EZO_Coin_Halves/text()",
            EZO_Coin_Quarters: "EZO_Coin_Quarters/text()",
            EZO_Coin_Dimes: "EZO_Coin_Dimes/text()",
            EZO_Coin_Nickels: "EZO_Coin_Nickels/text()",
            EZO_Coin_Pennies: "EZO_Coin_Pennies/text()",
            EZO_Coin_Total: "EZO_Coin_Total/text()",
            EZO_Coin_Loose_Dollars: "EZO_Coin_Loose_Dollars/text()",
            EZO_Coin_Loose_Halves: "EZO_Coin_Loose_Halves/text()",
            EZO_Coin_Loose_Quarters: "EZO_Coin_Loose_Quarters/text()",
            EZO_Coin_Loose_Dimes: "EZO_Coin_Loose_Dimes/text()",
            EZO_Coin_Loose_Nickels: "EZO_Coin_Loose_Nickels/text()",
            EZO_Coin_Loose_Pennies: "EZO_Coin_Loose_Pennies/text()",
            EZO_Coin_Loose_Total: "EZO_Coin_Loose_Total/text()",
            EZO_Total_Requested: "EZO_Total_Requested/text()",
            EZO_10_CTA_Box: "EZO_10_CTA_Box/text()",
            EZO_20_CTA_Box: "EZO_20_CTA_Box/text()",
            EZO_Reduced_CTA_Box: "EZO_Reduced_CTA_Box/text()",
            EZO_Reduced_Student_CTA_Box: "EZO_Reduced_Student_CTA_Box/text()",
            EZO_Location: "EZO_Location/text()",
            EZO_Order_Notes: "EZO_Order_Notes/text()"
          }
        }
      },
      change: onEZOBound,
      error: function (e) {
        handleError(e);
      }
    });
    orderTemplate = dataSource;
    dataSource.read();
  } catch (err) {
    showModalView("Cannot Load Order: " + err.Message, true);
    hideLoad();
  }
}
function onEZOBound() {
  try {
    var readonly = bReadonly;
    bReadonly = false;
    clearPrevOrder();
    var ds = this.view()[0];
    var strDate;
    // first validate our delivery date
    var bDate = false;
    strDate = GetDateValFormat(ds.EZO_Delivery_Date);

    $(".deld").each(function (i) {
      if (strDate == $(this).val()) { bDate = true }
    });
    $("#txtF100s").val(parseFloat(ds.EZO_Curr_Hundreds).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF50s").val(parseFloat(ds.EZO_Curr_Fifties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF20s").val(parseFloat(ds.EZO_Curr_Twenties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF10s").val(parseFloat(ds.EZO_Curr_Tens).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF5s").val(parseFloat(ds.EZO_Curr_Fives).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF2s").val(parseFloat(ds.EZO_Curr_Twos).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtF1s").val(parseFloat(ds.EZO_Curr_Ones).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtFTotal").val('$' + parseFloat(ds.EZO_Curr_Total).formatMoney(0, '.', ','));

    $("#txtA100s").val(parseFloat(ds.EZO_Curr_ATM_Hundreds).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA50s").val(parseFloat(ds.EZO_Curr_ATM_Fifties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA20s").val(parseFloat(ds.EZO_Curr_ATM_Twenties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA10s").val(parseFloat(ds.EZO_Curr_ATM_Tens).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA5s").val(parseFloat(ds.EZO_Curr_ATM_Fives).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA2s").val(parseFloat(ds.EZO_Curr_ATM_Twos).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtA1s").val(parseFloat(ds.EZO_Curr_ATM_Ones).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtATotal").val('$' + parseFloat(ds.EZO_Curr_ATM_Total).formatMoney(0, '.', ','));

    $("#txtN100s").val(parseFloat(ds.EZO_Curr_NEW_Hundreds).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN50s").val(parseFloat(ds.EZO_Curr_NEW_Fifties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN20s").val(parseFloat(ds.EZO_Curr_NEW_Twenties).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN10s").val(parseFloat(ds.EZO_Curr_NEW_Tens).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN5s").val(parseFloat(ds.EZO_Curr_NEW_Fives).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN2s").val(parseFloat(ds.EZO_Curr_NEW_Twos).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtN1s").val(parseFloat(ds.EZO_Curr_NEW_Ones).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtNTotal").val('$' + parseFloat(ds.EZO_Curr_NEW_Total).formatMoney(0, '.', ','));

    $("#txtC100s").val(parseFloat(ds.EZO_Coin_Dollars).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtC50s").val(parseFloat(ds.EZO_Coin_Halves).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtC25s").val(parseFloat(ds.EZO_Coin_Quarters).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtC10s").val(parseFloat(ds.EZO_Coin_Dimes).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtC5s").val(parseFloat(ds.EZO_Coin_Nickels).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtC1s").val(parseFloat(ds.EZO_Coin_Pennies).formatMoney(2, '.', '')).attr('readonly', readonly);
    $("#txtCTotal").val('$' + parseFloat(ds.EZO_Coin_Total).formatMoney(2, '.', ','));

    $("#txtLC100s").val(parseFloat(ds.EZO_Coin_Loose_Dollars).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLC50s").val(parseFloat(ds.EZO_Coin_Loose_Halves).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLC25s").val(parseFloat(ds.EZO_Coin_Loose_Quarters).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLC10s").val(parseFloat(ds.EZO_Coin_Loose_Dimes).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLC5s").val(parseFloat(ds.EZO_Coin_Loose_Nickels).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLC1s").val(parseFloat(ds.EZO_Coin_Loose_Pennies).formatMoney(0, '.', '')).attr('readonly', readonly);
    $("#txtLCTotal").val('$' + parseFloat(ds.EZO_Coin_Loose_Total).formatMoney(0, '.', ','));

    $("#txt10CTA").val(ds.EZO_10_CTA_Box).attr('readonly', readonly);
    $("#txt20CTA").val(ds.EZO_20_CTA_Box).attr('readonly', readonly);
    $("#txtRF").val(ds.EZO_Reduced_CTA_Box).attr('readonly', readonly);
    $("#txtST_RF").val(ds.EZO_Reduced_Student_CTA_Box).attr('readonly', readonly);

    $('.oeitm').each(function (index, e) {
      if ((this.value == '0') || (this.value == '0.00')) {
      }
    });
    var ordTotal = '$' + (parseFloat(ds.EZO_Total_Requested)).formatMoney(2, '.', ',')

    $("#txtVMPTotal").val(parseInt(ds.EZO_10_CTA_Box)
            + parseInt(ds.EZO_20_CTA_Box)
            + parseInt(ds.EZO_Reduced_CTA_Box)
            + parseInt(ds.EZO_Reduced_Student_CTA_Box));
    $(".ordt").val(ordTotal);
    $(".spnRequested").html(ordTotal);

    $("#txtTotalOrderRequested").val(cleanAmount(ordTotal));
    $("#txtTotalOrderRequested").focus();
    $("#txtTotalOrderRequested").blur();
    $("#dtDeliveryDate").val(strDate);
    $("#dtSummaryDeliveryDate").val(strDate);
    $("#ddLocations").val(ds.EZO_Location);
    calcOrder();

    sessionStorage.ordid = ds.EZO_ID;
    if (readonly) {
      $(".rvword").hide();
      sessionStorage.ordaction = 'view';

    } else {

      $(".rvword").show();
      sessionStorage.ordaction = 'edit';
    }
    sessionStorage.ordnotes = ds.EZO_Order_Notes;

    if (sessionStorage.ordaction == 'view') {
      $(".oeitm").addClass("ro");
    }
    else {
      $(".oeitm").removeClass("ro");
    }

    $(".deld").each(function (i) {
      if (strDate == $(this).val()) { bDate = true }
    });

    sessionStorage.dateneeded = false;
    if (!bDate) {
      sessionStorage.dateneeded = true;
      if (sessionStorage.ordaction == 'edit') {
        showModalViewDate();
      } else {
        app.navigate("#buttongroup-home");
      }

    } else {
      app.navigate("#buttongroup-home");
    }
  } catch (err) {
    showModalView("Cannot Load Order History: " + err.Message, true);
  }
  hideLoad();
}

// ** PENDING ORDER HISTORY FUNCTIONS  ** //

function bindHistory() { //(e) {
  var valid = true;
  try {
    showLoad();
    var loc = $("#ddLocHistory");
    if (!IsRequired(loc, null, 'combo', 'Location Is Required')) { valid = false; }

    if (valid) {
      var dataSource = new kendo.data.DataSource({
        transport: {
          read: {
            type: "POST",
            dataType: "xml",
            url: "WebController.aspx?mn=GetPendingOrderList&rn=" + Math.random().toString().replace(".", "") + "&loc=" + escape(loc.val())
          }
        },
        schema: {
          type: "xml",
          data: "/orders/order",
          model: {
            fields: {
              Location: "Location/text()",
              OrderNumber: "OrderNumber/text()",
              DeliveryDate: "DeliveryDate/text()",
              OrderAmount: "OrderAmount/text()",
              OrderType: "OrderType/text()",
              DisableEdit: "DisableEdit/text()"
            }
          }
        },
        change: onHistChange,
        error: function (e) {
          handleError(e);
        }
      });
      dataSource.read();
    }
    else {
      hideLoad();
    }
  } catch (err) {
    showModalView("Cannot Load Order History: " + err.Message, true);
    hideLoad();
  }
}
function onHistChange() {
  try {
    $(".histline").remove();
    if (this.view().length == 0) {
      $(".ordULHist").append('<li class="histline" style="background-color: LightGray !important;"><h3 class="txtHdr">' + NO_RECORDS + '</h3></li>');
    } else {
      $("#divHistory").kendoMobileListView({
        dataSource: this.view(),
        template: kendo.template($("#templHistory").html())
      });
      $("#divHistory .orderTempItems").each(function (index) {
        $(".ordULHist").append('<li class="histline">' + $(this).html() + '</li>');
      });
      $("#divHistory").html("");
    }
    var buttons = $(".btnView").kendoMobileButton({ click: bindOrderViewClick });
    var buttons = $(".btnEdit").kendoMobileButton({ click: bindOrderEditClick });
    var buttons = $(".btnDelete").kendoMobileButton({ click: bindOrderDeleteClick });

    $(".DisableEdit").hide();

  } catch (err) {
    showModalView("Cannot Load Order History: " + err.Message, true);
  }
  hideLoad();
}

function bindOrderViewClick(e) {
  e.preventDefault();
  var ordID = e.button[0].getAttribute("oid");
  bindEZChangeOrder(ordID, true);
}
function bindOrderEditClick(e) {
  e.preventDefault();
  var ordID = e.button[0].getAttribute("oid");
  bindEZChangeOrder(ordID, false);
}
function bindOrderDeleteClick(e) {
  e.preventDefault();
  var ordID = e.button[0].getAttribute("oid");
  var locID = $("#ddLocHistory").val();
  confirmDeleteOrder(ordID);
  sessionStorage.delord = ordID;
  sessionStorage.delloc = locID;
}
// ** PENDING ORDER REPORT FUNCTIONS  ** //
function bindPendingOrdersRPT() { //(e) {
  var valid = true;
  try {
    showLoad();
    var loc = $("#ddLocReport");
    if (!IsRequired(loc, null, 'combo', 'Location Is Required')) { valid = false; }
    if (valid) {
      var dataSource = new kendo.data.DataSource({
        transport: {
          read: {
            type: "POST",
            dataType: "xml",
            url: "WebController.aspx?mn=GetPendingOrderReport&rn=" + Math.random().toString().replace(".", "") + "&loc=" + escape(loc.val())
          }
        },
        schema: {
          type: "xml",
          data: "/orders/order",
          model: {
            fields: {
              Cust_Name: "Cust_Name/text()",
              EZO_Location: "EZO_Location/text()",
              EZC_Name: "EZC_Name/text()",
              EZB_Description: " EZB_Description/text()",
              EZO_ID: "EZO_ID/text()",
              EZO_Cust_ID: "EZO_Cust_ID/text()",
              EZO_DOF: "EZO_DOF/text()",
              EZO_Delivery_Date: "EZO_Delivery_Date/text()",
              VMP: "VMP/text()",
              COIN: "COIN/text()",
              CURR: "CURR/text()",
              EZO_Total_Requested: "EZO_Total_Requested/text()"
            }
          }
        },
        change: onPendingOrdersChange,
        error: function (e) {
          handleError(e);
        }
      });
      dataSource.read();
    }
    else {
      hideLoad();
    }
  } catch (err) {
    showModalView("Cannot Load Pending Orders Report: " + err.Message, true);
    hideLoad();
  }
}
function onPendingOrdersChange() {
  try {
    $(".pendline").remove();
    // if no records insert line
    if (this.view().length == 0) {
      $(".ordULPendingReportHist").append('<li class="pendline" style="background-color: LightGray !important;"><h3 class="txtHdr">' + NO_RECORDS + '</h3></li>');
    } else {
      // insert the html into list views
      $("#divPendingOrderHistory").kendoMobileListView({
        dataSource: this.view(),
        template: kendo.template($("#templPendingReport").html())
      });
      $("#divPendingOrderHistory .orderTempItems").each(function (index) {
        $(".ordULPendingReportHist").append('<li class="pendline">' + $(this).html() + '</li>');
      });

      // clear the temporary div
      $("#divPendingOrderHistory").html("");
    }
  } catch (err) {
    showModalView("Cannot Load Order History: " + err.Message, true);
  }
  hideLoad();
}
// ** MODAL WINDOW FUNCTIONS ** //
function closeModalView(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-message").kendoMobileModalView("close");
  }, TIME_OUT);
}
function closeModalViewSessExp(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-message").kendoMobileModalView("close");
    window.location.href = 'home.aspx';
  }, TIME_OUT);
}
function closeModalViewDate(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-dateneeded").kendoMobileModalView("close");
    app.navigate("#orders");

  }, TIME_OUT);
}
function closeModalViewSent(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-mess-sent").kendoMobileModalView("close");
  }, TIME_OUT);
}
function closeModalViewVal(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-validate").kendoMobileModalView("close");
  }, TIME_OUT);
}
function closeModalViewValClient(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-validate-client").kendoMobileModalView("close");
  }, TIME_OUT);
}
function closeModalViewCnf(e) {
  if (e != undefined) { e.preventDefault(); }

  setTimeout(function () {
    $("#modalview-confirm").kendoMobileModalView("close");
  }, TIME_OUT);
}
function closeModalViewCnfDel(e) {
  if (e != undefined) { e.preventDefault(); }
  setTimeout(function () {
    $("#modalview-confirm-delete").kendoMobileModalView("close");
  }, TIME_OUT);
}
function showModalView(mess, bError, title) {
  if (title == undefined) { title = "Required" };
  if (bError) { title = "Error"; }
  $("#modTitle").text(title);
  $("#modDesc").text(mess);
  $("#modalview-message").kendoMobileModalView("open");
}

function showModalViewSessExp() {
  $("#modalview-sess-exp").kendoMobileModalView("open");
}
function showModalViewDate() {
  sessionStorage.dateneeded = false;
  $("#modalview-dateneeded").kendoMobileModalView("open");
}
function showModalResult(mess, bError) {
  title = "Confirmation";
  if (bError) { title = "Error"; }
  $("#modTitle").text(title);
  $("#modDesc").text(mess);
  $("#modalview-message").kendoMobileModalView("open");
}

function showModalViewInvalid(mess, bError) {
  title = "Invalid Selection";
  //if (bError) { title = "An Error Has Occurred"; }
  $("#modTitle").text(title);
  $("#modDesc").text(mess);
  $("#modalview-message").kendoMobileModalView("open");
}

function showModalViewSent(mess, bError) {
  title = "Message Sent";
  if (bError) { title = "Error"; }
  $("#modTitleSent").text(title);
  $("#modDescSent").text(mess);
  $("#modalview-mess-sent").kendoMobileModalView("open");
}

function showModalViewVal(mess, bError) {
  $("#modDescVal").html(mess);
  $("#modalview-validate").kendoMobileModalView("open");
}
function showModalViewValClient(mess, bError) {
  $("#modDescValClient").html(mess);
  $("#modalview-validate-client").kendoMobileModalView("open");
}
function showModalConfirmed(mess, bError) {
  title = "Order Submitted";
  if (bError) { title = "Error"; }
  $("#modTitle").text(title);
  $("#modDesc").html(mess);
  $("#modalview-message").kendoMobileModalView("open");
}
function orderConfirmed(e) {
  $("#modalview-confirm").kendoMobileModalView("close");
  processConfimOrder();
}
//  ** GENERAL ** //
function goBack(e) {
  GOBACK = true;
  $(".ord_tot_confirm").hide();
  showTotal = false;
  if (!sessionStorage.userauth) {
    $(".lnkHide").hide();
  }
  showLoad();
  setTimeout(function () {
    scrollTop();
    hideLoad();
  }, TIME_OUT);

  setTimeout(function () {
    history.back();
  }, TIME_OUT);

}
function processHomeNav(e) {
  e.preventDefault();
  showLoad();
  setTimeout(function () {
    hideLoad();
    switch (e.item[0].id) {
      case "lnkLogin":
        app.navigate("#login");
        break;
      case "lnkSupport":
        app.navigate("#support");
        break;
      case "lnkContact":
        app.navigate("#contact");
        break;
      case "lnkPackrules":
        app.navigate("#packrules");
        break;
      case "lnkPassword":
        app.navigate("#forgotpw");
        break;
    }
  }, TIME_OUT);

  $(".lnkBack").show();
}

function getCookie(Name) {
  try {
    var Argument, ArgumetLength, CookieLength, EndString, i, j;
    Argument = Name + "=";
    ArgumentLength = Argument.length;
    CookieLength = document.cookie.length;
    i = 0;
    while (i < CookieLength) {
      j = i + ArgumentLength;
      if (document.cookie.substring(i, j) == Argument) {
        EndString = document.cookie.indexOf(";", j);
        if (EndString == -1)
          EndString = document.cookie.length;
        return unescape(document.cookie.substring(j, EndString));
      }
      i = document.cookie.indexOf(" ", i) + 1;
      if (i == 0)
        break;
    }
    return (null);
  } catch (err) {
    showModalView("Cannot Load Preferences: " + err.Message, true, "");
  }
}
function checkemail(strng) {
  var emailFilter = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/; //you@yourdomain.com
  strng = strng.trim();
  if (!(emailFilter.test(strng))) { return false; } else { return true; }
}

function checkPassword(strPass) {
  var re = new RegExp(/^.*(?=.{8,})(?=.*\d)(?=.*[a-z]|[A-Z]).*$/);
  var pass = strPass.toString();
  if (pass.length > 0) {
    if (!pass.match(re)) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

function GetDayName(day) {
  switch (day) {
    case 0: return 'Sunday,'; break;
    case 1: return 'Monday,'; break;
    case 2: return 'Tuesday,'; break;
    case 3: return 'Wednesday,'; break;
    case 4: return 'Thursday,'; break;
    case 5: return 'Friday,'; break;
    case 6: return 'Saturday,'; break;
  }
}
function GetDateValFormat(dt) {

  var y, m, d, strDate;
  var aD = dt.split("/");
  m = aD[0];
  d = aD[1];
  y = aD[2];
  if (m.length == 1) { m = '0' + m; }
  if (d.length == 1) { d = '0' + d; }

  strDate = y + '-' + m + '-' + d;
  return strDate;
}

Number.prototype.formatMoney = function (c, d, t) {
  try {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  } catch (err) {
    showModalView("Error trying to load module: " + err.Message, true);
  }
};