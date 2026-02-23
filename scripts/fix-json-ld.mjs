#!/usr/bin/env node
import{readFileSync as r,writeFileSync as w,readdirSync as d,statSync as s}from'fs';
import{join as j,resolve}from'path';
const D=resolve(import.meta.dirname,'..','public','edges');
const VA={'SoFi Stadium':{s:'1001 Stadium Dr',l:'Inglewood',p:'90301',r:'CA',c:'US'},
'MetLife Stadium':{s:'1 MetLife Stadium Dr',l:'East Rutherford',p:'07073',r:'NJ',c:'US'},
'Mercedes-Benz Stadium':{s:'1 AMB Dr NW',l:'Atlanta',p:'30313',r:'GA',c:'US'},
'Lincoln Financial Field':{s:'1 Lincoln Financial Field Way',l:'Philadelphia',p:'19148',r:'PA',c:'US'},
'Hard Rock Stadium':{s:'347 Don Shula Dr',l:'Miami Gardens',p:'33056',r:'FL',c:'US'},
'Lumen Field':{s:'800 Occidental Ave S',l:'Seattle',p:'98134',r:'WA',c:'US'},
'NRG Stadium':{s:'1 NRG Park',l:'Houston',p:'77054',r:'TX',c:'US'},
'AT&T Stadium':{s:'1 AT&T Way',l:'Arlington',p:'76011',r:'TX',c:'US'},
'Gillette Stadium':{s:'1 Patriot Pl',l:'Foxborough',p:'02035',r:'MA',c:'US'},
"Levi's Stadium":{s:'4900 Marie P DeBartolo Way',l:'Santa Clara',p:'95054',r:'CA',c:'US'},
'GEHA Field at Arrowhead Stadium':{s:'1 Arrowhead Dr',l:'Kansas City',p:'64129',r:'MO',c:'US'},
'BC Place':{s:'777 Pacific Blvd',l:'Vancouver',p:'V6B 4Y8',r:'BC',c:'CA'},
'BMO Field':{s:'170 Princes Blvd',l:'Toronto',p:'M6K 3C3',r:'ON',c:'CA'},
'Estadio Azteca':{s:'Calz. de Tlalpan 3465',l:'Mexico City',p:'04530',r:'CDMX',c:'MX'},
'Estadio Akron':{s:'Av. de las Rosas 3581',l:'Guadalajara',p:'45116',r:'JAL',c:'MX'},
'Estadio BBVA':{s:'Av. Pablo Livas 2011',l:'Guadalupe',p:'67170',r:'NL',c:'MX'}};

function addr(n){
  const v=VA[n];if(!v)for(const[k,x]of Object.entries(VA))if(n.includes(k)||k.includes(n))return x;
  return v||null;
}

let ok=0,er=0;
const dirs=d(D).filter(x=>s(j(D,x)).isDirectory());
console.log(`Found ${dirs.length} edge directories`);
for(const dir of dirs){
  const f=j(D,dir,'index.html');
  try{
    let h=r(f,'utf-8');
    const m=h.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    if(!m){console.log(`SKIP ${dir}`);continue;}
    const sc=JSON.parse(m[1]);
    sc.eventStatus=sc.eventStatus||'https://schema.org/EventScheduled';
    sc.eventAttendanceMode=sc.eventAttendanceMode||'https://schema.org/OfflineEventAttendanceMode';
    if(sc.location){const a=addr(sc.location.name);
      if(a)sc.location.address={'@type':'PostalAddress',streetAddress:a.s,addressLocality:a.l,postalCode:a.p,addressRegion:a.r,addressCountry:a.c};
      else if(typeof sc.location.address==='string')sc.location.address={'@type':'PostalAddress',addressLocality:sc.location.address};}
    sc.organizer=sc.organizer||{'@type':'Organization',name:'FIFA',url:'https://www.fifa.com'};
    sc.url=sc.url||`https://thedrip.to/edges/${dir}/`;
    const nj=JSON.stringify(sc,null,4);
    h=h.replace(/<script type="application\/ld\+json">\s*[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n  ${nj.split('\n').join('\n  ')}\n  </script>`);
    w(f,h,'utf-8');ok++;
  }catch(e){console.error(`ERR ${dir}: ${e.message}`);er++;}
}
console.log(`Done: ${ok} updated, ${er} errors`);
