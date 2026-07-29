/* <batik-map> — Indonesia map (d3 + world-atlas), clickable batik-center markers.
   Requires window.d3 & window.topojson (loaded in the page helmet). */
(function () {
  const REGIONS = [
    { id: 'solo', label: 'Surakarta', c: [110.83, -7.57] },
    { id: 'yogya', label: 'Yogyakarta', c: [110.36, -7.80] },
    { id: 'pekalongan', label: 'Pekalongan', c: [109.68, -6.89] },
    { id: 'cirebon', label: 'Cirebon', c: [108.56, -6.73] },
    { id: 'lasem', label: 'Lasem', c: [111.45, -6.69] },
    { id: 'madura', label: 'Madura', c: [113.48, -7.16] },
    { id: 'tuban', label: 'Tuban', c: [112.06, -6.90] },
    { id: 'tasik', label: 'Tasikmalaya', c: [108.22, -7.33] },
    { id: 'jakarta', label: 'Jakarta', c: [106.85, -6.21] },
    { id: 'banten', label: 'Banten', c: [106.15, -6.12] },
    { id: 'jambi', label: 'Jambi', c: [103.61, -1.61] },
    { id: 'palembang', label: 'Palembang', c: [104.75, -2.99] },
    { id: 'minang', label: 'Padang', c: [100.35, -0.95] },
    { id: 'bengkulu', label: 'Bengkulu', c: [102.26, -3.79] },
    { id: 'banjarmasin', label: 'Banjarmasin', c: [114.59, -3.32] },
    { id: 'palangkaraya', label: 'Palangka Raya', c: [113.92, -2.21] },
    { id: 'palu', label: 'Palu', c: [119.87, -0.90] },
    { id: 'toraja', label: 'Toraja', c: [119.85, -3.05] },
    { id: 'bali', label: 'Bali', c: [115.19, -8.54] },
    { id: 'ntb', label: 'Lombok–Bima', c: [116.12, -8.58] },
    { id: 'papua', label: 'Papua', c: [140.70, -2.53] },
    { id: 'maluku', label: 'Tanimbar', c: [131.30, -7.97] }
  ];
  window.BATIK_REGIONS = REGIONS;
  // label placement per region: [dx, dy, anchor, leader?] — dense Java cluster is
  // staggered into tiers above/below the island with thin leader lines
  const LBL = {
    jakarta: [-10, -4, 'end'], banten: [-10, 14, 'end'],
    cirebon: [0, -24, 'middle', 1], lasem: [0, -24, 'middle', 1],
    pekalongan: [0, -46, 'middle', 1], tuban: [0, -46, 'middle', 1],
    tasik: [0, 26, 'middle', 1], yogya: [0, 44, 'middle', 1], solo: [4, -70, 'middle', 1],
    madura: [11, 4, 'start'],
    bali: [-11, 5, 'end'], ntb: [11, 9, 'start'], papua: [-11, 5, 'end']
  };
  const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
  // label laut bergaya satelit
  const SEAS = [
    { n: 'Laut Jawa', c: [113.2, -5.1] },
    { n: 'Laut Sulawesi', c: [121.8, 2.9] },
    { n: 'Laut Banda', c: [127.6, -5.6] },
    { n: 'Laut Arafura', c: [135.3, -9.2] },
    { n: 'Samudra Hindia', c: [100.0, -10.0] },
    { n: 'Selat Makassar', c: [117.5, -1.8] }
  ];
  let topoPromise = null;
  function loadTopo() {
    if (!topoPromise) topoPromise = fetch(TOPO_URL).then(r => r.json());
    return topoPromise;
  }
  function waitFor(cond) {
    return new Promise(res => {
      (function poll() { cond() ? res() : setTimeout(poll, 60); })();
    });
  }

  class BatikMap extends HTMLElement {
    constructor() {
      super();
      this._selected = null;
      this._labels = true;
    }
    set labels(v) { this._labels = v !== false && v !== 'off'; this._drawLabels && this._drawLabels(); }
    get labels() { return this._labels; }
    static get observedAttributes() { return ['labels']; }
    attributeChangedCallback(n, _o, v) { if (n === 'labels') this.labels = v; }
    connectedCallback() {
      this.style.display = 'block';
      if (this.getAttribute('labels') !== null) this._labels = this.getAttribute('labels') !== 'off';
      this._render();
      this._onResize = () => {
        clearTimeout(this._rt);
        this._rt = setTimeout(() => this._render(), 200);
      };
      window.addEventListener('resize', this._onResize);
    }
    disconnectedCallback() { window.removeEventListener('resize', this._onResize); }
    async _render() {
      await waitFor(() => window.d3 && window.topojson);
      const d3 = window.d3, topojson = window.topojson;
      const topo = await loadTopo();
      if (!this.isConnected) return;
      const countries = topojson.feature(topo, topo.objects.countries);
      const indo = countries.features.find(f => String(f.id) === '360' || (f.properties && f.properties.name === 'Indonesia'));
      const w = this.clientWidth || 960;
      const h = Math.max(300, Math.round(w * 0.42));
      const proj = window.d3.geoMercator().fitExtent([[14, 14], [w - 14, h - 14]], indo);
      const path = d3.geoPath(proj);
      this.innerHTML = '';
      const svg = d3.create('svg')
        .attr('viewBox', `0 0 ${w} ${h}`)
        .attr('width', '100%')
        .style('display', 'block')
        .attr('role', 'img')
        .attr('aria-label', 'Peta sentra batik Indonesia');
      // gaya kartografi terang, senada dengan situs
      const defs = svg.append('defs');
      const seaGrad = defs.append('radialGradient').attr('id', 'seaGrad').attr('cx', '50%').attr('cy', '40%').attr('r', '80%');
      seaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#CFE1E2');
      seaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B4CBD0');
      const landGrad = defs.append('linearGradient').attr('id', 'landGrad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
      landGrad.append('stop').attr('offset', '0%').attr('stop-color', '#CBD8A6');
      landGrad.append('stop').attr('offset', '55%').attr('stop-color', '#BFCF9A');
      landGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B4C692');
      svg.append('rect').attr('width', w).attr('height', h).attr('fill', 'url(#seaGrad)').attr('rx', 8);
      svg.append('g').selectAll('path').data(countries.features.filter(f => f !== indo)).join('path')
        .attr('d', path)
        .attr('fill', '#D8DFC6')
        .attr('stroke', 'rgba(120,132,104,0.35)')
        .attr('stroke-width', 0.7);
      svg.append('path').datum(indo)
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(150,186,196,0.55)')
        .attr('stroke-width', 7)
        .attr('stroke-linejoin', 'round');
      svg.append('path').datum(indo)
        .attr('d', path)
        .attr('fill', 'url(#landGrad)')
        .attr('stroke', '#7E9068')
        .attr('stroke-width', 1.1);
      svg.append('g').selectAll('text').data(SEAS).join('text')
        .attr('x', d => proj(d.c)[0]).attr('y', d => proj(d.c)[1])
        .text(d => d.n)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Alegreya Sans, sans-serif')
        .attr('font-style', 'italic')
        .attr('font-size', Math.max(11, w / 82))
        .attr('fill', 'rgba(74,112,134,0.8)')
        .attr('letter-spacing', '0.06em')
        .style('pointer-events', 'none');
      const gm = svg.append('g');
      const gl = svg.append('g');
      const self = this;
      const pts = REGIONS.map(r => ({ ...r, xy: proj(r.c) }));
      gm.selectAll('g.mk').data(pts).join('g')
        .attr('class', 'mk')
        .attr('transform', d => `translate(${d.xy[0]},${d.xy[1]})`)
        .style('cursor', 'pointer')
        .each(function (d) {
          const g = d3.select(this);
          g.append('circle').attr('class', 'halo').attr('r', 11).attr('fill', 'rgba(68,80,126,0.16)');
          g.append('circle').attr('class', 'dot').attr('r', 5.5)
            .attr('fill', '#44507E').attr('stroke', '#F6F0E2').attr('stroke-width', 1.6);
        })
        .on('mouseenter', function () { d3.select(this).select('.dot').attr('r', 7.5); })
        .on('mouseleave', function (e, d) { d3.select(this).select('.dot').attr('r', self._selected === d.id ? 7.5 : 5.5); })
        .on('click', function (e, d) { self._select(d.id); });
      this._drawLabels = () => {
        gl.selectAll('*').remove();
        if (!this._labels) return;
        const fs = Math.max(10, Math.min(13, w / 90));
        gl.selectAll('line').data(pts.filter(d => LBL[d.id] && LBL[d.id][3])).join('line')
          .attr('x1', d => d.xy[0]).attr('x2', d => d.xy[0])
          .attr('y1', d => d.xy[1] + (LBL[d.id][1] < 0 ? -9 : 9))
          .attr('y2', d => d.xy[1] + LBL[d.id][1] + (LBL[d.id][1] < 0 ? 4 : -11))
          .attr('stroke', 'rgba(90,104,78,0.5)').attr('stroke-width', 1).attr('opacity', 0.85)
          .style('pointer-events', 'none');
        gl.selectAll('text').data(pts).join('text')
          .attr('x', d => d.xy[0] + (LBL[d.id] ? LBL[d.id][0] : 10))
          .attr('y', d => d.xy[1] + (LBL[d.id] ? LBL[d.id][1] : 4))
          .attr('text-anchor', d => LBL[d.id] ? LBL[d.id][2] : 'start')
          .text(d => d.label)
          .attr('font-family', 'Alegreya Sans, sans-serif')
          .attr('font-size', fs)
          .attr('fill', '#3D3527')
          .attr('paint-order', 'stroke')
          .attr('stroke', 'rgba(248,246,236,0.9)')
          .attr('stroke-width', 3)
          .style('pointer-events', 'none');
      };
      this._drawLabels();
      this._svg = svg;
      this._gm = gm;
      this.appendChild(svg.node());
      if (this._selected) this._paintSel();
    }
    _select(id) {
      this._selected = id;
      this._paintSel();
      const r = REGIONS.find(x => x.id === id);
      this.dispatchEvent(new CustomEvent('region-select', {
        detail: { id, label: r ? r.label : id }, bubbles: true, composed: true
      }));
    }
    _paintSel() {
      if (!this._gm) return;
      const sel = this._selected;
      this._gm.selectAll('g.mk').each(function (d) {
        const g = window.d3.select(this);
        const on = d.id === sel;
        g.select('.dot').attr('fill', on ? '#7A5427' : '#44507E').attr('r', on ? 7.5 : 5.5);
        g.select('.halo').attr('r', on ? 15 : 11)
          .attr('fill', on ? 'rgba(122,84,39,0.22)' : 'rgba(68,80,126,0.16)');
      });
    }
    // programmatic selection (from page chips)
    select(id) { this._select(id); }
  }
  customElements.define('batik-map', BatikMap);
})();
