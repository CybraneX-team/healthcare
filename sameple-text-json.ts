export const samplePdfData = {
  liver: {
    bilirubin: null,
    alt: null,
    ast: null,
    ggt: null,
    gene_based: {
      c677t: null,
      gstm1: null,
    },
    enzymes: {
      amylase: null,
      maltase: null,
      protease: null,
      lactase: null,
      lipase: null,
      sucrase: null,
      occult_blood: null,
    },
    fatty_liver: null, // true / false, or grade if reported
  },

  kidney: {
    random_urine_albumin: null,
    urine_ph: null,
    bun: null,
    egfr: null,
    uric_acid: null,
    heavy_metals: {
      mercury: null,
      cadmium: null,
      lead: null,
    },
    bpa: null,
    hydration: null, // value derived from water-intake notes
  },

  brain: {
    cd_risc: null,
    p_tau217: null,
    rmssd: null,
    sdnn: null,
    gait_readiness: null,
    neurotransmitters: {
      gaba: null,
      dopamine: null,
      serotonin: null,
    },
    brain_impression_log: '',
  },

  heart: {
    heart_rate: null,
    heart_recovery_rate: null,
    heart_rate_variability: null,
    cholesterol: null,
    homocysteine: null,
    hs_crp: null,
    nt_bnp: null,
    aortic_compliance: null,
    blood_pressure: {
      systolic: null,
      diastolic: null,
    },
    imt: null,
    troponin: null,
  },

  lungs: {
    vo2_max: null,
    heart_rate_variability: null,
    pulmonary_capacity: null,
    spo2: null,
    chest_impression_log: '',
  },

  hormonal_reproductive: {
    general: {
      // results that apply to any patient
      hormones_panel: '',
      igf_1: null,
      hba1c: null,
      snps: {
        comt: null,
        cyps: null,
      },
    },

    women: {
      vitamin_d_25oh_total: null,
      progesterone: null,
      ldh: null,
      insulin_fasting: null,
      transferrin: null,
      thyroid_panel_comprehensive: '',
      testosterone_bioavailable: {
        total: null,
        free: null,
        bio_available: null,
        shbg: null,
      },
      t4_total: null,
      t3_total: null,
      a1c: null,
      ggt: null,
      fsh: null,
      lh: null,
      estradiol_e2: null,
      dhea_sulfate: null,
      cortisol: null,
      androstenedione: null,
      igf_1: null,
    },

    men: {
      testosterone_total: null,
      testosterone_free: null,
      shbg: null,
      estradiol: null,
      estrone: null,
      dhea_s: null,
      fsh: null,
      lh: null,
      dht: null,
      prolactin: null,
      progesterone: null,
      psa: null,
      tsh: null,
      ft4: null,
      ft3: null,
      vitamin_d_25oh: null,
      parathyroid_hormone: null,
      cmp: null,
      lipids: null,
      insulin: null,
      hba1c: null,
      hs_crp: null,
      homocysteine: null,
      androstenedione: null,
      igf_1: null,
    },
  },
}
