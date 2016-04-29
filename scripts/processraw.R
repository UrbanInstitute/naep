# Hannah Recht, 03-16-16
# NAEP adjustments feature

library("dplyr")
library("ggplot2")
library("tidyr")
library("readxl")

########################################################################################################
# Map variable names (score_m# where 1 <= # <= 128) to binary 0 1 concatenation
########################################################################################################

varnames <- read_excel("/Users/hrecht/Documents/Box Sync/COMM/**Project Folders**/NAEP (National Assessment of Educational Progress)/Data Files/Variable Combinations_New.xlsx", sheet="VarNames1")

varnames <- varnames[,c(1, 8:13)]
colnames(varnames) <- c("score_m", "race", "frpl", "lep", "sped", "age", "enghome")

varnames <- varnames %>% filter(!is.na(score_m)) %>%
  mutate(score_m = paste("score_m", score_m, sep=""))
varnames <- varnames %>% mutate(newname = paste("score_", race, frpl, lep, sped, age, enghome, sep=""))

write.csv(varnames, "data/variablenames.csv", na="", row.names=F)

# Later sessions, read in
varnames <- read.csv("data/variablenames.csv", stringsAsFactors = F)

# Prepare to join to existing varnames - make dataset with old names as colnames, new names as row 1
names <- varnames %>% select(score_m, newname)
names <- t(names)
colnames(names) <- names[1,]
names <- as.data.frame(names)
names[] <- lapply(names, as.character)
names <- names[2,] %>% mutate(year = "year", FIPS = "FIPS", subject = "subject", grade = "grade")

########################################################################################################
# Join raw data into long dataset with rows by grade, subject, year, state
########################################################################################################

math4 <- read.csv("data/original/i_math4_2015.csv", stringsAsFactors = F)
math8 <- read.csv("data/original/i_math8_2015.csv", stringsAsFactors = F)
read4 <- read.csv("data/original/i_read4_2015.csv", stringsAsFactors = F)
read8 <- read.csv("data/original/i_read8_2015.csv", stringsAsFactors = F)

math4 <- math4 %>% mutate(grade = 4, subject = "math")
math8 <- math8 %>% mutate(grade = 8, subject = "math")
read4 <- read4 %>% mutate(grade = 4, subject = "reading")
read8 <- read8 %>% mutate(grade = 8, subject = "reading")

naepfull <- rbind(math4, read4, math8, read8)
naepfull <- naepfull %>% select(year, FIPS, grade, subject, everything()) %>%
  select(-starts_with("score_st_"))

# Add new column names to score vars
naepleft <- naepfull %>% select(-starts_with("score_m"))
naepscores <- naepfull %>% select(starts_with("score_m"), year, FIPS, grade, subject)
naepscores <- rbind(names, naepscores)
colnames(naepscores) <- naepscores[1,]

naepscores <- naepscores[-1,]
naepscores[,1:64] <- lapply(naepscores[,1:64] , as.numeric)
naepscores$grade <- as.numeric(naepscores$grade)
naepscores$year <- as.numeric(naepscores$year)

# Rejoin newly named cols to demographic info
naep <- left_join(naepleft, naepscores, by = c("year", "FIPS", "grade", "subject"))

# Rank over time
#naep <- naep %>% 
#  arrange(year, grade, subject, -score_111111) %>%
#  group_by(year, grade, subject) %>%
#  mutate(rank=row_number())

# See what we have by year
years <- naep %>% mutate(p = 1) %>%
  group_by(year, grade, subject) %>%
  summarize(states = sum(p))
#write.csv(years, "data/testsbyyear.csv", row.names = F)

# Keep 1996 + 
# We have one weird phantom 2000 reading row - remove that
naep <- naep %>% filter(year >= 1996) %>% 
  filter(!(year==2000 & subject=="reading"))
# Full name for DC
naep <- naep %>% mutate(FIPS = ifelse(FIPS == "D.C.", "District of Columbia", FIPS))

# Export data
write.csv(naep, "data/main.csv", row.names=F, na="")

########################################################################################################
# Exploratory viz
########################################################################################################

# 2013 long subset
naep <- naepfull[,c(1:27, 29, 283)]
long2013 <- naep %>% filter(year==2013) %>% 
	mutate(temp = score_m128) %>% 
	gather(type, score, score_m1:score_m128) %>%
	mutate(type = ifelse(type=="score_m1", "unadjusted", "adjusted"))

# Dot plots
dotplot <- function(gr, subj, title) {
	dat <- long2013 %>% filter(grade==gr & subject==subj)
	dat$FIPS <- factor(dat$FIPS , levels = dat$FIPS[order(dat$temp)])
	ggplot(dat, aes(x=score, y=FIPS, color=type, group=FIPS)) + 
		geom_line(color="black") + 
		geom_point(size=2) + 
		ggtitle(title)
} 

png(filename = "charts/reading4_2013.png", width=800, height=1000, res=100)
dotplot(4, "reading", "Fourth grade reading, 2013")
dev.off()

png(filename = "charts/reading8_2013.png", width=800, height=1000, res=100)
dotplot(8, "reading", "Eighth grade reading, 2013")
dev.off()

png(filename = "charts/math4_2013.png", width=800, height=1000, res=100)
dotplot(4, "math", "Fourth grade math, 2013")
dev.off()

png(filename = "charts/math8_2013.png", width=800, height=1000, res=100)
dotplot(8, "math", "Eighth grade math, 2013")
dev.off()

# Look at rank over time
naep <- naep %>% mutate(scorediff = score_m128 - score_m1) %>%
	filter(year > 1994)

# rank over time SMALL MULTIPLESSS
temp <- naep %>% filter(grade==8 & subject=="math")
ggplot() + geom_step(data=temp, aes(x=year, y=-rank, group=FIPS)) + facet_wrap( ~ FIPS)