// Markdown shaped like datalab's paginated output of the Chapter 99 PDF.
// Wording is abbreviated; the structure (headings, nesting, page breaks,
// continuation headings, tariff table) is what matters.

export const CH99_REV_A = `{0}------------------------------------------------

# CHAPTER 99

## TEMPORARY LEGISLATION; TEMPORARY MODIFICATIONS PROCLAIMED PURSUANT TO TRADE AGREEMENTS LEGISLATION; ADDITIONAL IMPORT RESTRICTIONS

### Notes

1. The provisions of this chapter relate to legislation and to executive and administrative actions pursuant to duly constituted authority, under which--

(a) the rates of duty in the "Rates of Duty" columns of chapters 1 to 97 are temporarily amended;

(b) additional duties are imposed.

2. The provisions of this chapter are not subject to the rule of relative specificity.

### Statistical Note

1. For statistical reporting of merchandise provided for in this chapter, report the 10-digit number.

{1}------------------------------------------------

## SUBCHAPTER III

#### TEMPORARY MODIFICATIONS ESTABLISHED PURSUANT TO TRADE LEGISLATION

### U.S. Notes

1. This subchapter contains modifications of the provisions of the tariff schedule.

2. (a) Heading 9903.01.25 applies to all products of a listed country, except as provided in subdivision (c) of this note.

(b) The additional duties shall be imposed on articles entered on or after April 5, 2025.

(c) Notwithstanding the foregoing:

(i) products of Canada classifiable in 7208.10.15 or 7208.25.30 are excluded; and

(ii) the term "listed country" means a country named in subdivision (c)(iii) of this note.

(iii) Listed countries: Brazil, India and Vietnam, as provided in note 6(a) to this subchapter.

(d) Duties under this note do not stack with heading 9903.81.90.

{2}------------------------------------------------

### U.S. Notes (con.)

3. Heading 9903.01.30 covers articles of the following subheadings:

| Subheading | Subheading |
|---|---|
| 0101.21.00 | 0101.29.00 |
| 8471.30.0100 | 8471.41.01 |

4. [Deleted]

6. (a) For purposes of heading 9903.81.90, the term "steel derivative" means articles of the following:

(A) Nails classifiable in 7317.00.30;

(B) Bumpers classifiable in 8708.10.30.

(b) Heading 9903.81.91 applies to articles entered on or after March 12, 2025.

| Heading/Subheading | Stat. Suffix | Article Description | Rates of Duty |
|---|---|---|---|
| 9903.01.25 | | Products of listed countries | The duty provided in the applicable subheading + 10% |
| 9903.01.30 | | Articles of note 3 | 25% |

1/ See subchapter III U.S. note 2.
`

// Rev B: note 2(b) date changed, a new 2(e) added, list in note 3 changed,
// note 6(a)(B) renumbered to (C) with a new (B), Canada exclusion reworded
export const CH99_REV_B = `{0}------------------------------------------------

# CHAPTER 99

## TEMPORARY LEGISLATION; TEMPORARY MODIFICATIONS PROCLAIMED PURSUANT TO TRADE AGREEMENTS LEGISLATION; ADDITIONAL IMPORT RESTRICTIONS

### Notes

1. The provisions of this chapter relate to legislation and to executive and administrative actions pursuant to duly constituted authority, under which--

(a) the rates of duty in the "Rates of Duty" columns of chapters 1 to 97 are temporarily amended;

(b) additional duties are imposed.

2. The provisions of this chapter are not subject to the rule of relative specificity.

### Statistical Note

1. For statistical reporting of merchandise provided for in this chapter, report the 10-digit number.

{1}------------------------------------------------

## SUBCHAPTER III

#### TEMPORARY MODIFICATIONS ESTABLISHED PURSUANT TO TRADE LEGISLATION

### U.S. Notes

1. This subchapter contains modifications of the provisions of the tariff schedule.

2. (a) Heading 9903.01.25 applies to all products of a listed country, except as provided in subdivision (c) of this note.

(b) The additional duties shall be imposed on articles entered on or after May 1, 2025.

(c) Notwithstanding the foregoing:

(i) products of Canada or Mexico classifiable in 7208.10.15 or 7208.25.30 are excluded; and

(ii) the term "listed country" means a country named in subdivision (c)(iii) of this note.

(iii) Listed countries: Brazil, India and Vietnam, as provided in note 6(a) to this subchapter.

(d) Duties under this note do not stack with heading 9903.81.90.

(e) Articles in transit before the effective date, other than articles described in note 6(a) to this subchapter, are not subject to the additional duties.

{2}------------------------------------------------

### U.S. Notes (con.)

3. Heading 9903.01.30 covers articles of the following subheadings:

| Subheading | Subheading |
|---|---|
| 0101.21.00 | 0101.30.00 |
| 8471.30.0100 | 8471.41.01 |

4. [Deleted]

6. (a) For purposes of heading 9903.81.90, the term "steel derivative" means articles of the following:

(A) Nails classifiable in 7317.00.30;

(B) Screws classifiable in 7318.15.20;

(C) Bumpers classifiable in 8708.10.30.

(b) Heading 9903.81.91 applies to articles entered on or after March 12, 2025.

| Heading/Subheading | Stat. Suffix | Article Description | Rates of Duty |
|---|---|---|---|
| 9903.01.25 | | Products of listed countries | The duty provided in the applicable subheading + 10% |
| 9903.01.30 | | Articles of note 3 | 25% |
`

export const CH99_JSON_A = [
  { htsno: "9903.01.25", indent: "0", description: "Products of listed countries", general: "The duty provided in the applicable subheading + 10%", special: "", other: "", units: [], footnotes: [] },
  { htsno: "", indent: "1", description: "Except as provided in note 2:", general: "", special: "", other: "", units: [], footnotes: [] },
  { htsno: "9903.01.30", indent: "0", description: "Articles of note 3", general: "25%", special: "", other: "", units: [] as string[], footnotes: [{ columns: ["general"], marker: "1", value: "See subchapter III U.S. note 3." }] },
]

export const CH99_JSON_B = [
  { htsno: "9903.01.25", indent: "0", description: "Products of listed countries", general: "The duty provided in the applicable subheading + 15%", special: "", other: "", units: [], footnotes: [] },
  { htsno: "", indent: "1", description: "Except as provided in note 2:", general: "", special: "", other: "", units: [], footnotes: [] },
  { htsno: "9903.01.30", indent: "0", description: "Articles of note 3", general: "25%", special: "", other: "", units: [] as string[], footnotes: [{ columns: ["general"], marker: "1", value: "See subchapter III U.S. note 3." }] },
  { htsno: "9903.01.31", indent: "0", description: "Articles of note 2(e) in transit", general: "Free", special: "", other: "", units: [], footnotes: [] },
]
