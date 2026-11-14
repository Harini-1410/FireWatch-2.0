/**
 * FireWatch 2.0 - Synthetic / Mock Data Engine
 * High-fidelity synthetic generation implementing the Latent Fire Activity Index (LFAI)
 * and NASA FIRMS observation effort model principles.
 */

export const PRESET_REGIONS = [
  {
    id: 'amazon',
    name: 'Amazon Basin',
    bbox: [-15.0, -75.0, 5.0, -45.0], // [min_lat, min_lon, max_lat, max_lon]
    center: [-5.0, -60.0],
    zoom: 5,
    biome: 'Tropical Moist Forest',
    peakMonths: [8, 9, 10], // Aug, Sep, Oct
    cloudyMonths: [12, 1, 2, 3], // Dec - Mar rainy season
    baseFireCount: 2200,
    variance: 0.35,
    description: 'South American tropical rainforest and agricultural frontier'
  },
  {
    id: 'se_asia',
    name: 'Southeast Asia',
    bbox: [-5.0, 95.0, 20.0, 115.0],
    center: [7.5, 105.0],
    zoom: 5,
    biome: 'Tropical Peatland & Seasonal Forest',
    peakMonths: [2, 3, 4, 8, 9], // Feb-Apr mainland, Aug-Sep maritime
    cloudyMonths: [6, 7, 11, 12],
    baseFireCount: 1650,
    variance: 0.40,
    description: 'Mekong basin and Indonesian peatlands'
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Basin',
    bbox: [30.0, -10.0, 45.0, 40.0],
    center: [38.0, 15.0],
    zoom: 5,
    biome: 'Mediterranean Sclerophyll & Shrubland',
    peakMonths: [7, 8, 9], // Jul, Aug, Sep
    cloudyMonths: [11, 12, 1],
    baseFireCount: 950,
    variance: 0.50,
    description: 'Southern Europe, North Africa, and Levant coastal zones'
  },
  {
    id: 'india',
    name: 'India & South Asia',
    bbox: [8.0, 68.0, 37.0, 97.0],
    center: [22.5, 82.5],
    zoom: 5,
    biome: 'Monsoon Subtropical & Dry Deciduous',
    peakMonths: [3, 4, 5, 10, 11], // Spring forest fires & Autumn crop residue
    cloudyMonths: [6, 7, 8], // Monsoon months with intense cloud cover (<3 clear-sky days)
    baseFireCount: 1800,
    variance: 0.30,
    description: 'Agricultural residues, Western Ghats, and Central Indian dry forests'
  },
  {
    id: 'california',
    name: 'California & US West',
    bbox: [32.5, -124.5, 42.0, -114.1],
    center: [37.2, -119.5],
    zoom: 6,
    biome: 'Temperate Conifer & Chaparral',
    peakMonths: [7, 8, 9, 10], // Jul - Oct
    cloudyMonths: [1, 2, 12],
    baseFireCount: 750,
    variance: 0.65,
    description: 'Sierra Nevada, chaparral, and coastal ranges'
  },
  {
    id: 'australia',
    name: 'Southeast Australia',
    bbox: [-39.0, 140.0, -28.0, 154.0],
    center: [-33.5, 147.0],
    zoom: 6,
    biome: 'Temperate Eucalypt & Grassland',
    peakMonths: [11, 12, 1, 2], // Nov - Feb
    cloudyMonths: [6, 7],
    baseFireCount: 1200,
    variance: 0.70,
    description: 'New South Wales and Victoria temperate forests (Black Summer corridor)'
  }
];

/**
 * Determine sensor constellation for a given year & month
 */
export function getSensorInfoForDate(year, month) {
  // Timeline:
  // 2000-01 to 2002-05: MODIS Terra only (1 sensor)
  // 2002-06 to 2011-12: MODIS Terra + Aqua (2 sensors)
  // 2012-01 to 2017-12: MODIS (Terra+Aqua) + VIIRS Suomi-NPP (3 sensors)
  // 2018-01 to 2022-12: + VIIRS NOAA-20 (4 sensors)
  // 2023-01 to 2026-10: + VIIRS NOAA-21 (5 sensors)
  // 2026-11+: Suomi-NPP retired Nov 2026, Terra on standby (3 sensors: Aqua, NOAA-20, NOAA-21)
  
  if (year < 2002 || (year === 2002 && month < 6)) {
    return {
      n_sensors: 1,
      sensors: ['MODIS-Terra'],
      saturation: 0.45, // Desaturated to encode single-sensor uncertainty
      quality: 'Moderate'
    };
  } else if (year < 2012) {
    return {
      n_sensors: 2,
      sensors: ['MODIS-Terra', 'MODIS-Aqua'],
      saturation: 1.0,
      quality: 'High'
    };
  } else if (year < 2018) {
    return {
      n_sensors: 3,
      sensors: ['MODIS-Terra', 'MODIS-Aqua', 'VIIRS-SNPP'],
      saturation: 1.0,
      quality: 'High'
    };
  } else if (year < 2023) {
    return {
      n_sensors: 4,
      sensors: ['MODIS-Terra', 'MODIS-Aqua', 'VIIRS-SNPP', 'VIIRS-NOAA20'],
      saturation: 1.0,
      quality: 'High'
    };
  } else if (year === 2026 && month >= 11) {
    return {
      n_sensors: 3,
      sensors: ['MODIS-Aqua', 'VIIRS-NOAA20', 'VIIRS-NOAA21'],
      notes: 'Suomi-NPP retired Nov 2, 2026; Terra on standby',
      saturation: 0.85,
      quality: 'High'
    };
  } else {
    return {
      n_sensors: 5,
      sensors: ['MODIS-Terra', 'MODIS-Aqua', 'VIIRS-SNPP', 'VIIRS-NOAA20', 'VIIRS-NOAA21'],
      saturation: 1.0,
      quality: 'High'
    };
  }
}

/**
 * Generate synthetic calendar heatmap data for given bbox and date range
 */
export function generateMockCalendar(bbox, startDate = '2000-01', endDate = '2026-11') {
  // Find matching preset or compute regional params
  const [minLat, minLon, maxLat, maxLon] = bbox;
  const areaDegrees = Math.abs(maxLat - minLat) * Math.abs(maxLon - minLon);
  const isSparse = areaDegrees < 2.0; // Area guard

  // Match closest preset for seasonal dynamics
  const preset = PRESET_REGIONS.find(p => 
    Math.abs(p.bbox[0] - minLat) < 15 && Math.abs(p.bbox[1] - minLon) < 25
  ) || PRESET_REGIONS[0];

  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);

  const grid = [];

  // Historical month medians for anomaly computation
  const monthlyMedians = {};
  for (let m = 1; m <= 12; m++) {
    const isPeak = preset.peakMonths.includes(m);
    const multiplier = isPeak ? 2.4 : preset.cloudyMonths.includes(m) ? 0.35 : 0.8;
    monthlyMedians[m] = Math.round(preset.baseFireCount * multiplier);
  }

  for (let y = startYear; y <= endYear; y++) {
    const mStart = (y === startYear) ? startMonth : 1;
    const mEnd = (y === endYear) ? endMonth : 12;

    for (let m = mStart; m <= mEnd; m++) {
      const sensorInfo = getSensorInfoForDate(y, m);
      const isPeak = preset.peakMonths.includes(m);
      const isCloudy = preset.cloudyMonths.includes(m);

      // Deterministic pseudo-random seed based on year, month and bbox
      const seed = Math.sin(y * 12 + m + minLat + minLon) * 10000;
      const noise = (seed - Math.floor(seed)) * 2 - 1; // -1 to +1

      // Notable historical climate anomalies
      let climateFactor = 1.0;
      if (y === 2010 && [8, 9].includes(m)) climateFactor = 1.65; // 2010 Amazon drought
      if (y === 2015 && [8, 9, 10].includes(m)) climateFactor = 1.75; // 2015 El Nino
      if (y === 2019 && [8, 9].includes(m)) climateFactor = 1.55; // 2019 Amazon fires
      if (y === 2020 && [8, 9, 10].includes(m)) climateFactor = 1.80; // 2020 US West record
      if (y === 2024 && [7, 8, 9].includes(m)) climateFactor = 1.70; // 2024 Global heat/drought

      const median = monthlyMedians[m];
      const count = Math.max(15, Math.round(median * (climateFactor + noise * preset.variance)));
      
      const anomaly = parseFloat((((count - median) / median) * 100).toFixed(1));

      // Alert classification based on anomaly
      let alertStatus = 'Normal';
      if (anomaly > 35) alertStatus = 'Unusual';
      else if (anomaly > 10) alertStatus = 'Elevated';

      // Clear sky observation days & hatching flag
      // If intensely cloudy, <3 clear-sky observation days
      const clearSkyDays = isCloudy ? Math.max(1, Math.round(3 + noise * 2)) : Math.round(18 + noise * 6);
      const isHatched = clearSkyDays < 3;
      const dataQuality = isHatched ? 'Low' : sensorInfo.n_sensors === 1 ? 'Moderate' : 'High';

      grid.push({
        year: y,
        month: m,
        date: `${y}-${String(m).padStart(2, '0')}`,
        harmonized_count: count,
        median: median,
        anomaly: anomaly,
        alert_status: alertStatus,
        n_sensors: sensorInfo.n_sensors,
        sensors: sensorInfo.sensors,
        saturation: sensorInfo.saturation,
        clear_sky_days: clearSkyDays,
        is_hatched: isHatched,
        data_quality: dataQuality,
        effort_score: parseFloat((clearSkyDays / 30 * (sensorInfo.n_sensors / 3)).toFixed(2)),
        is_sparse: isSparse
      });
    }
  }

  return {
    region: preset.name,
    bbox: bbox,
    startDate: startDate,
    endDate: endDate,
    is_sparse: isSparse,
    grid: grid
  };
}

/**
 * Generate synthetic /alert response
 */
export function generateMockAlert(bbox, targetMonth = '2026-08') {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  const preset = PRESET_REGIONS.find(p => 
    Math.abs(p.bbox[0] - minLat) < 15 && Math.abs(p.bbox[1] - minLon) < 25
  ) || PRESET_REGIONS[0];

  const [y, m] = targetMonth.split('-').map(Number);
  const isPeak = preset.peakMonths.includes(m);

  return {
    alert_label: 'Elevated',
    percentile: 88.5,
    probability_exceed_90th: 0.84,
    harmonized_count: 1845,
    baseline_median: 1380,
    anomaly_pct: 33.7,
    current_month: targetMonth,
    region: preset.name,
    explanation: `Harmonized fire activity is 33.7% above the 25-year historical median for ${targetMonth}. Day-aligned satellite observation effort model confirms elevated thermal anomalies across the chosen spatial domain with 84% probability of exceeding the 90th percentile.`,
    is_synthetic: true
  };
}

/**
 * Generate synthetic /sensor-transition response
 */
export function generateMockSensorTransition(bbox, startDate = '2000-01', endDate = '2026-11', excludeTerra = false) {
  const [minLat, minLon] = bbox;
  const preset = PRESET_REGIONS.find(p => 
    Math.abs(p.bbox[0] - minLat) < 15 && Math.abs(p.bbox[1] - minLon) < 25
  ) || PRESET_REGIONS[0];

  const series = [];
  const [startYear] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);

  for (let y = Math.max(2000, startYear); y <= endYear; y++) {
    const mMax = (y === endYear) ? endMonth : 12;
    for (let m = 1; m <= mMax; m++) {
      const isPeak = preset.peakMonths.includes(m);
      const isCloudy = preset.cloudyMonths.includes(m);
      const base = preset.baseFireCount * (isPeak ? 1.8 : isCloudy ? 0.4 : 0.9);

      const seed = Math.sin(y * 12 + m + minLat) * 5000;
      const noise = (seed - Math.floor(seed)) * 0.4 - 0.2; // -0.2 to +0.2

      // MODIS: available from 2000. If excludeTerra is active, drops ~45% of MODIS detections
      let modisVal = Math.round(base * 0.65 * (1 + noise));
      if (y < 2002) modisVal = Math.round(modisVal * 0.55); // Terra only
      if (excludeTerra) {
        modisVal = Math.round(modisVal * 0.52); // Terra removed!
      }

      // VIIRS: available from 2012 onward (375m pixel sees more small fires => higher count)
      let viirsVal = null;
      if (y >= 2012) {
        const viirsSensors = (y >= 2023) ? 3 : (y >= 2018) ? 2 : 1;
        viirsVal = Math.round(base * 1.55 * (1 + noise) * (1 + (viirsSensors - 1) * 0.15));
      }

      // Harmonized Latent Fire Activity Index (LFAI)
      // Removes the 2012 step change artifact by using the observation-process model!
      const harmonizedVal = Math.round(base * (1 + noise));
      
      // Uncertainty interval (90% credible interval)
      // Note: when excludeTerra is true, interval WIDENS by ~40% while median remains stable!
      const uncertaintyFactor = excludeTerra ? 0.28 : (y < 2012 ? 0.22 : 0.12);
      const ciLower = Math.max(0, Math.round(harmonizedVal * (1 - uncertaintyFactor)));
      const ciUpper = Math.round(harmonizedVal * (1 + uncertaintyFactor));

      series.push({
        date: `${y}-${String(m).padStart(2, '0')}`,
        year: y,
        month: m,
        modis: modisVal,
        viirs: viirsVal,
        harmonized: harmonizedVal,
        ci_lower: ciLower,
        ci_upper: ciUpper
      });
    }
  }

  return {
    region: preset.name,
    exclude_terra: excludeTerra,
    overlap_period: { start: '2012-01', end: '2026-11' },
    series: series,
    is_synthetic: true
  };
}

/**
 * Generate synthetic /reliability response
 */
export function generateMockReliability(bbox, startDate = '2000-01', endDate = '2026-11') {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  const area = Math.abs(maxLat - minLat) * Math.abs(maxLon - minLon);

  let score = 94;
  let level = 'High';
  const passedChecks = [
    'Negative-binomial observation effort model calibrated',
    'NASA POWER daily cloud fraction incorporated',
    'Multi-sensor cross-calibration over 2012–2026 overlap period',
    '25-year consistent historical baseline (2000–2025)',
    'Biome-specific sensitivity offsets against NOAA-20/21 VIIRS anchor',
    'Day-aligned partial month comparison (prevents anomaly inflation)'
  ];

  const failedChecks = [];

  if (area < 4.0) {
    score -= 28;
    level = 'Moderate';
    failedChecks.push('Small bounding box (< 4 sq deg): low spatial sample size increases variance in negative-binomial effort fitting');
  }

  failedChecks.push('Suomi NPP VIIRS retired Nov 2, 2026: reduces constellation redundancy for late-2026 estimates');
  failedChecks.push('Terra MODIS on standby (March 2026 anomaly): MODIS daytime observation relies primarily on Aqua');

  if (score < 60) level = 'Low';
  else if (score < 80) level = 'Moderate';

  return {
    reliability_score: score,
    reliability_level: level,
    passed_checks: passedChecks,
    failed_checks: failedChecks,
    explanation: `${level} statistical reliability (${score}/100). The LFAI observation model normalizes sensor count variations across the selected spatial area, maintaining consistent baseline estimates despite recent satellite fleet changes.`,
    details: {
      n_sensors_current: 3,
      n_sensors_historical_avg: 2.85,
      months_with_obs: 312,
      baseline_years: 26,
      coverage_pct: 98.4,
      cloud_adjusted_effort: '0.88'
    },
    is_synthetic: true
  };
}

/**
 * Generate synthetic CSV export string for /export
 */
export function generateMockCSV(bbox, startDate, endDate) {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  
  const headers = [
    '# NASA Space Apps Challenge 2026 - FireWatch 2.0 Harmonized Dataset',
    '# Data Attribution: Data from NASA FIRMS (Fire Information for Resource Management System)',
    `# Bounding Box: [${minLat}, ${minLon}, ${maxLat}, ${maxLon}]`,
    `# Date Range: ${startDate} to ${endDate}`,
    '# Harmonization: Latent Fire Activity Index (LFAI) with Observation-Effort Modeling',
    'satellite,acquisition_utc,latitude,longitude,frp,confidence_normalized,included_in_lfai'
  ];

  const satellites = ['MODIS-Terra', 'MODIS-Aqua', 'VIIRS-NOAA20', 'VIIRS-NOAA21'];
  const rows = [];

  for (let i = 0; i < 150; i++) {
    const lat = (minLat + Math.random() * (maxLat - minLat)).toFixed(4);
    const lon = (minLon + Math.random() * (maxLon - minLon)).toFixed(4);
    const sat = satellites[Math.floor(Math.random() * satellites.length)];
    const frp = (12.5 + Math.random() * 85.0).toFixed(1);
    const conf = (0.65 + Math.random() * 0.35).toFixed(2);
    const d = new Date(2026, 7, Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    const dtUtc = d.toISOString().replace('.000Z', 'Z');
    
    rows.push(`${sat},${dtUtc},${lat},${lon},${frp},${conf},true`);
  }

  return headers.join('\n') + '\n' + rows.join('\n');
}
