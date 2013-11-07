<%@ Page Language="VB" AutoEventWireup="false" CodeFile="home2.aspx.vb" Inherits="home2" %>

<!DOCTYPE html>
<html>
<head runat="server">
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
  <meta http-equiv="CACHE-CONTROL" content="NO-CACHE, NO-STORE">
  <meta http-equiv="PRAGMA" content="NO-CACHE">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <title>No Worky</title>
  <link href="<%= string.Format("styles/kendo.common.min.css?rn={0}", VERSION)%>" type="text/css"
    rel="Stylesheet" />
  <link href="<%= string.Format("styles/kendo.mobile.all.min.css?rn={0}", VERSION)%>"
    type="text/css" rel="Stylesheet" />
  <link href="<%= string.Format("styles/mobile.css?rn={0}", VERSION)%>" type="text/css"
    rel="Stylesheet" />
  <link href="<%= string.Format("styles/add2home.css?rn={0}", VERSION)%>" type="text/css"
    rel="Stylesheet" />
  <script type="text/javascript" src="<%= string.Format("js/jquery.min.js?rn={0}", VERSION)%>"></script>
  <script type="text/javascript" src="<%= string.Format("js/kendo.mobile.min.js?rn={0}", VERSION)%>"></script>
  <script type="text/javascript" src="<%= string.Format("js/add2home.js?rn={0}", VERSION)%>"></script>
  <script type="text/javascript" src="<%= string.Format("js/utility.js?rn={0}", VERSION)%>"></script>
  <script type="text/javascript">
    var addToHomeConfig = {
      returningVisitor: true,
      expire: 720,
      bottomOffset: 30
    };
  </script>
  <script type="text/javascript">
    function OpenLink(theLink) {
      window.location.href = theLink.href;
    }
  </script>
</head>
<body>
  <div data-role="view" data-layout="default" id="home" data-title="No Worky" data-show="home_onShow"
     class="hideload">
    <ul data-role="listview" data-style="inset" data-type="group">
      <li>
        <ul>
          <li class="title">
            <h3 class="txt2">
              Choose an Option Below</h3>
          </li>
        </ul>
    <ul id="mnyFit" class="ordSect" data-role="listview" data-style="inset" style="margin-top: 3px !important">
      <li id="Q1" class="qh">Enter FIT $ Amounts</li>
      <li id="unFIT" class="unavail" style="display: none">No FIT Ordering Allowed</li>
      <li id="liF1s" class="ordSectItm">Ones<input id="txtF1s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $1s" data-vld="Ones"></li>
      <li id="liF2s" class="ordSectItm">Twos<input id="txtF2s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $2s" data-vld="Twos"></li>
      <li id="liF5s" class="ordSectItm">Fives<input id="txtF5s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $5s" data-vld="Fives"></li>
      <li id="liF10s" class="ordSectItm">Tens<input id="txtF10s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $10s" data-vld="Tens"></li>
      <li id="liF20s" class="ordSectItm">Twenties<input id="txtF20s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $20s" data-vld="Twenties"></li>
      <li id="liF50s" class="ordSectItm">Fifties<input id="txtF50s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $50s" data-vld="Fifties"></li>
      <li id="liF100s" class="ordSectItm">Hundreds<input id="txtF100s" type="text" pattern="[0-9]*"
        value="0" class="fm oe oeitm" data-desc="FIT $100s" data-vld="Hundreds"></li>
      <li style="color: Red;">Fit $ Total:<input id="txtFTotal" type="text" class="fmt oe"
        data-totals="true" value="0" tabindex="-1" readonly="readonly"></li>
      <li style="color: Red;">Order Grand Total:<input id="ordGrandTotal" tabindex="-1"
        type="text" class="ordt" readonly="readonly"></li>
    </ul>
      </li>
    </ul>
  </div>

  <section data-role="layout" data-id="default">

    <header data-role="header" style="background-color:Black" class="header">
      <div data-role="navbar" background-repeat: no-repeat;
        background-position: top; height: 55px;" class="hideload">
        <table style="height:70px !important; width:100%; margin-bottom:2px !important">
          <tr>
            <td><a data-role="button" data-align="left" data-click="goBack" class="lnkBack lnkHide" id="lnkBack">Back</a> </td>
            <td style="vertical-align:bottom !important"><span style="color:White;font-size:0.6em;font-weight:normal !important; vertical-align:bottom !important" class="spTitle"></span></td>
            <td><a id="lnkLogout" data-align="right" data-role="button" data-click="logOut" class="lnkHide">Logout</a></td>
            <td></td>
          </tr>
        </table>        
      </div>
    </header>
    <footer data-role="footer" class="footer">
    
      <div data-role="tabstrip" id="tabstrip" data-select="navigatePage" class="hideload">
        <a data-icon="home" href="#home" id="lnkHome">Home</a> 
        <a data-icon="organize" href="#welcome" id="lnkWelcome">Order</a> 
        <a data-icon="contacts" href="#account" id="lnkAccountPrefs">Account</a> 
        <a data-icon="compose" id="lnkPendingReport" href="#orderPendingReport">Reporting</a>
      </div>          
    </footer>
  </section>
  <script type="text/javascript">
    //var iTab = 0;

    var url = window.location.href;
    var r = Math.random();
    var aUrl = url.split("?");
    var aView;
    var sView = '';
    var bSkip = false;
    if (aUrl.length > 1) {
      aView = aUrl[1].toString().split("#");
      if (aView.length > 1) {
        sView = '#' + aView[1];
      }
    }
    var app = new kendo.mobile.Application($(document.body), {
      platform: {
        device: "iphone",       // Mobile device, can be "ipad", "iphone", "ipod", "android" "fire", "blackberry", "meego"
        name: "ios",          // Mobile OS, can be "ios", "android", "blackberry", "meego"
        ios: true,            // Mobile OS name as a flag
        majorVersion: 5,      // Major OS version
        minorVersion: "0.0",  // Minor OS versions
        flatVersion: "500",   // Flat OS version for easier comparison
        appMode: false,       // Whether running in browser or in AppMode/PhoneGap/Titanium.
        tablet: "ipad"        // If a tablet - tablet name or false for a phone.
      },
      transition: "fade"
    });

    function mobileOrderViewInit() {
      var listviews = this.element.find("ul.km-listview");

      $("#order-pad").kendoMobileButtonGroup({
        select: function (i) {
          listviews.hide()
                         .eq(this.selectedIndex)
                         .show();
          //          var iNewTab = i.sender.selectedIndex;
          //          validateTab(iTab, iNewTab);
          //          iTab = iNewTab;
        },
        index: 0
      });

    }

    var bExit = false;
    $(function () {
      try {
        if (bSkip) { bSkip = false; return; }
        var sc = app.scroller()

        sc.setOptions({
          elastic: false
        });

        var jTabStrip = $("#tabstrip");
        tabStrip = jTabStrip.data("kendoMobileTabStrip");

        // this gives the app enough time to prevent the FOUC
        showLoad();
        setTimeout(function () {
          hideLoad();
        }, 300);
        setTimeout(function () {
          setLoginPref(null);
        }, 300);


        setTimeout(function () {
          $(".hideload").removeClass("hideload");
        }, 300);


        $("input[type=text], input[type=password], input[type=email], textarea").blur(function () {
            app.scroller().reset();
          });

          $("input[type=text], input[type=password], input[type=email], textarea").kendoTouch({ tap: function (e) {
              var el = document.getElementById(e.sender.element[0].id);
              el.scrollIntoView(true);
          }
          });
      }
      catch (err) {
        alert("There was a problem loading this application: " & err.Message);
        //alert("This Mobile application is only supported on a WebKit browser.  Please use Safari, Chrome or other WebKit enabled browser.");
      }
    });
  </script>
</body>
</html>
