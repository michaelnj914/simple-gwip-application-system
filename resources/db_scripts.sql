
-- Mike, copy this entry and go to mysql Admin to create the table. Paste it under SQL tab and click GO

CREATE TABLE application ( 
id INT AUTO_INCREMENT PRIMARY KEY,


filedate DATE DEFAULT CURRENT_DATE,

-- Hire type checkboxes
chk_directhire INT DEFAULT 0,
chk_gwiphire INT DEFAULT 0,
chk_indirecthire INT DEFAULT 0,
referredBy VARCHAR(100),
first_choice VARCHAR(100),
second_choice VARCHAR(100),
third_choice VARCHAR(100),
applyFor VARCHAR(100) NOT NULL,
lastName VARCHAR(100) NOT NULL,
firstName VARCHAR(100) NOT NULL,
middleName VARCHAR(100),
address TEXT NOT NULL,
alternateAddress TEXT,
email VARCHAR(150) NOT NULL,
phone VARCHAR(50) NOT NULL,
civilStatus VARCHAR(50),
height VARCHAR(20),
weight VARCHAR(20),
birthdate DATE NOT NULL,
religion VARCHAR(100),
highestEducational VARCHAR(150),
courseTaken VARCHAR(150),
gender VARCHAR(20),
experience TEXT,
hobbies TEXT,
photo VARCHAR(255),

-- Education
university_name VARCHAR(150),
university_location VARCHAR(150),
university_year VARCHAR(20),
university_course VARCHAR(150),
college_name VARCHAR(150),
college_location VARCHAR(150),
college_year VARCHAR(20),
college_course VARCHAR(150),
highschool_name VARCHAR(150),
highschool_location VARCHAR(150),
highschool_year VARCHAR(20),
highschool_course VARCHAR(150),
elementary_name VARCHAR(150),
elementary_location VARCHAR(150),
elementary_year VARCHAR(20),
elementary_course VARCHAR(150),
technical_name VARCHAR(150),
technical_training VARCHAR(150),
technical_year VARCHAR(20),
technical_course VARCHAR(150),

-- Reviews
review1 VARCHAR(150),
review1_status VARCHAR(50),
review2 VARCHAR(150),
review2_status VARCHAR(50),
review3 VARCHAR(150),
review3_status VARCHAR(50),

-- Exams
exam1 VARCHAR(150),
exam1_year VARCHAR(20),
exam2 VARCHAR(150),
exam2_year VARCHAR(20),
exam3 VARCHAR(150),
exam3_year VARCHAR(20),
exam4 VARCHAR(150),
exam4_year VARCHAR(20),
exam5 VARCHAR(150),
exam5_year VARCHAR(20),
exam6 VARCHAR(150),
exam6_year VARCHAR(20),
exam7 VARCHAR(150),
exam7_year VARCHAR(20),
exam8 VARCHAR(150),
exam8_year VARCHAR(20),

-- Nursing qualifications
chk_reg_nurse_bsc INT DEFAULT 0,
chk_reg_nurse_diploma_nursing INT DEFAULT 0,
chk_reg_nurse_midwifery INT DEFAULT 0,
chk_reg_nurse_masters INT DEFAULT 0,
chk_reg_nurse_phd INT DEFAULT 0,
chk_reg_nurse_other INT DEFAULT 0,
nursing_other VARCHAR(150),

-- PT qualifications
chk_pt_bsc_pt INT DEFAULT 0, chk_pt_na INT DEFAULT 0,

-- Job specialties
chk_job_specialty_er INT DEFAULT 0,
chk_job_specialty_med_surg INT DEFAULT 0,
chk_job_specialty_general INT DEFAULT 0,
chk_job_specialty_icu INT DEFAULT 0,
chk_job_specialty_telemetry INT DEFAULT 0,
chk_job_specialty_pt INT DEFAULT 0,
chk_job_specialty_theater INT DEFAULT 0,
chk_job_specialty_pcu INT DEFAULT 0,
chk_job_specialty_ot INT DEFAULT 0,
chk_job_specialty_delivery INT DEFAULT 0,
chk_job_specialty_rehab INT DEFAULT 0,
chk_job_specialty_ortho INT DEFAULT 0,
chk_job_specialty_others INT DEFAULT 0,
job_specialty_other VARCHAR(150),

-- Nurse roles
chk_staff_nurse INT DEFAULT 0,
chk_charge_nurse INT DEFAULT 0,
chk_senior_nurse INT DEFAULT 0,
chk_director_nurse INT DEFAULT 0,
chk_head_nurse INT DEFAULT 0,
chk_sister_nurse INT DEFAULT 0,

-- Exam years
nclex_year VARCHAR(20),
cbt_year VARCHAR(20),
ielts_year VARCHAR(20),
haad_year VARCHAR(20),
toefl_year VARCHAR(20),
dha_year VARCHAR(20),
oet_year VARCHAR(20),
prometric_year VARCHAR(20),
other_exam_year VARCHAR(20),
pt_ot_year VARCHAR(20),

-- Licenses
prc_number VARCHAR(50),
prc_issued DATE,
prc_expiry DATE,
sss_number VARCHAR(50),
sss_issued DATE,
sss_expiry DATE,
driver_number VARCHAR(50),
driver_issued DATE,
driver_expiry DATE,
passport_number VARCHAR(50),
passport_issued DATE,
passport_expiry DATE,
place_of_issue VARCHAR(150),

-- Items
item1_name VARCHAR(100),
item1_value VARCHAR(100),
item2_name VARCHAR(100),
item2_value VARCHAR(100),
item3_name VARCHAR(100),
item3_value VARCHAR(100),
item4_name VARCHAR(100),
item4_value VARCHAR(100),
item5_name VARCHAR(100),
item5_value VARCHAR(100),

-- Work experience
company1 VARCHAR(150),
position1 VARCHAR(150),
country1 VARCHAR(100),
year1 VARCHAR(20),
job_desc1 TEXT,
company2 VARCHAR(150),
position2 VARCHAR(150),
country2 VARCHAR(100),
year2 VARCHAR(20),
job_desc2 TEXT,
company3 VARCHAR(150),
position3 VARCHAR(150),
country3 VARCHAR(100),
year3 VARCHAR(20),
job_desc3 TEXT,
company4 VARCHAR(150),
position4 VARCHAR(150),
country4 VARCHAR(100),
year4 VARCHAR(20),
job_desc4 TEXT,
company5 VARCHAR(150),
position5 VARCHAR(150),
country5 VARCHAR(100),
year5 VARCHAR(20),
job_desc5 TEXT,
company6 VARCHAR(150),
position6 VARCHAR(150),
country6 VARCHAR(100),
year6 VARCHAR(20),
job_desc6 TEXT,

-- Fields
field1 VARCHAR(150),
field2 VARCHAR(150),
field3 VARCHAR(150),
field4 VARCHAR(150),
field5 VARCHAR(150),
field6 VARCHAR(150),

-- Certificates
certificate1 VARCHAR(150),
certificate2 VARCHAR(150),
certificate3 VARCHAR(150),
certificate4 VARCHAR(150),
certificate5 VARCHAR(150),
certificate6 VARCHAR(150),

-- References
ref1_name VARCHAR(150),
ref1_phone VARCHAR(50),
ref1_address TEXT,
ref2_name VARCHAR(150),
ref2_phone VARCHAR(50),
ref2_address TEXT,

-- Sponsorship
previous_sponsor VARCHAR(150),
sponsored_activities TEXT,
sponsor_amount VARCHAR(50),

-- Requirements
requirement1 VARCHAR(150),
requirement2 VARCHAR(150),
requirement3 VARCHAR(150),
requirement4 VARCHAR(150),

-- Family
children_count VARCHAR(50),
children_ages VARCHAR(150),
spouse_name VARCHAR(150),
spouse_occupation VARCHAR(150),
spouse_birthdate DATE,
father_name VARCHAR(150),
father_occupation VARCHAR(150),
mother_name VARCHAR(150),
mother_occupation VARCHAR(150),
parents_address TEXT,
parents_phone VARCHAR(50),
parents_mobile VARCHAR(50),

-- Next of kin
nok_name VARCHAR(150),
nok_relationship VARCHAR(100),
nok_address TEXT,
nok_phone VARCHAR(50),
nok_email VARCHAR(150),

-- Beneficiaries

beneficiary1_name VARCHAR(150),
    beneficiary1_relationship VARCHAR(100),
    beneficiary1_address TEXT,
    beneficiary1_phone VARCHAR(50),
    
    beneficiary2_name VARCHAR(150),
    beneficiary2_relationship VARCHAR(100),
    beneficiary2_address TEXT,
    beneficiary2_phone VARCHAR(50),
    
    beneficiary3_name VARCHAR(150),
    beneficiary3_relationship VARCHAR(100),
    beneficiary3_address TEXT,
    beneficiary3_phone VARCHAR(50)
)ENGINE = InnoDB;



CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  password VARCHAR(255)
);

