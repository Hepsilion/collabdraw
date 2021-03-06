/*
 * AgoraWhiteBoardApi.js - Javascript API for Agora White Borad
 * GNU Licensed
 * Sun Yurun (sunyurun@agora.io)
 * http://agora.io
 * https://github.com/AgoraLab/collabdraw
 *
 */

var ErrorTable = {
    0: 'ok',
    1: 'agora vom service unavailable',
    2: 'no channel available',
    4: 'too many users',
    5: 'invalid vendor key',
    6: 'agora master vocs unavailable',
    7: 'invalid channel name',
    8: 'agora internal error',
    9: 'no authorized',
    10: 'dynamic key timeout',
    11: 'no active status',
    12: 'timeout',
    13: 'canceled'
 };

function ip2int(dot)
{
 var d = dot.split('.');
 return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function AgoraWhiteBoardApi() {
    this.canvasHeight = -1;
    this.canvasWidth = -1;
    this.canvasNode = null;
    this.cname = '';
    this.uid = '';
    this.vid='';
    this.role = ''

    this.defaultCanvasHeight = function() {
        return this.canvasNode ? $(this.canvasNode).height() : 600;
    }
    this.defaultCanvasWidth = function() {
        return this.canvasNode ? $(this.canvasNode).width() : 800;
    }

    this.join = function(params) {
        var key              = params.key,
            cname            = params.cname,
            uinfo            = params.uinfo,
            role             = params.role,
            mode             = params.mode,
            onJoin           = params.onJoin;

        this.cname = cname;
        this.role = role || 'host';
        _this = this;
        $.get('https://wb.agorabeckon.com:5555/getEdgeServer', {
            key   : key,
            cname : cname,
            uinfo : uinfo
        }, function (result, status) {
            if (!result || result.length == 0) {
                onJoin(-10, 'empty result from center server', cname, uinfo, uid)
                return;
            }
            var ip       = result['server'].substring(0, result['server'].indexOf(':'));
            var port     = result['server'].substring(result['server'].indexOf(':')+1);
            var redis_id = result['redis'];
            var vid      = result['vid'];
            var ticket   = result['ticket'];
            uinfo  = result['uinfo'].toString();
            console.log('ws '+ip+' '+port+'  '+ip2int(ip));
            ip='wbedge'+ip2int(ip)+'.agorabeckon.com';
            console.log('ws '+ip+' '+port);
            $.get('https://'+ip+ ':' + port + '/join', {
                cname    : cname,
                redis    : redis_id,
                vid      : vid,
                uinfo    : uinfo,
                ticket   : ticket,
                role     : role
            }, function (result, status) {
                if (!result || result.length == 0) {
                    onJoin(-10, 'empty result from agora server', cname, uinfo, uid)
                    return;
                }
                console.log(JSON.stringify(result));
                onJoin(result.code, ErrorTable[result['code'].toString()], cname, uinfo);
                if (result.code == 0) {
                    _this.uid = uinfo;
                    _this.vid = vid;
                    _this.render(ip, port);
                }
            }).fail(function(xhr, textStatus, errorThrown) {
                console.log("ajax fail to join edge server");
            });
        }).fail(function(xhr, textStatus, errorThrown) {
            console.log("ajax fail to get edge server");
        });
    }

    this.render = function(ip, port) {
        if (!this.canvasNode || (this.cname == '' || this.uid == '')) {
            return;
        }
        var app = new App();
        app.setAppIpAddress(ip);
        app.setAppPort(port);
        app.setCanvasHeight(this.canvasHeight == -1 ? this.defaultCanvasHeight() : this.canvasHeight);
        app.setCanvasWidth(this.canvasWidth == -1 ? this.defaultCanvasWidth() : this.canvasWidth);
        app.setRoom(this.cname);
        app.setUid(this.uid);
        app.setVid(this.vid);
        app.setRole(this.role);
        console.log('[render] height: ' + app.getCanvasHeight() + ' width: ' + app.getCanvasWidth() + ' room: ' + this.cname + ' uid: ' + this.uid);
        app.renderInto(this.canvasNode);
    }
}
