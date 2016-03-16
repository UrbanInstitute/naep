# Hannah Recht, 03-16-16
# NAEP adjustments feature

library(dplyr)
library(ggplot2)
library(tidyr)

math4 <- read.csv("data/original/i_math4.csv", stringsAsFactors = F)
math8 <- read.csv("data/original/i_math8.csv", stringsAsFactors = F)
read4 <- read.csv("data/original/i_read4.csv", stringsAsFactors = F)
read8 <- read.csv("data/original/i_read8.csv", stringsAsFactors = F)

math4 <- math4 %>% mutate(grade = 4, subject = "math")
math8 <- math8 %>% mutate(grade = 8, subject = "math")
read4 <- read4 %>% mutate(grade = 4, subject = "reading")
read8 <- read8 %>% mutate(grade = 8, subject = "reading")

naepfull <- rbind(math4, read4, math8, read8)
naepfull <- naepfull %>% select(year, FIPS, grade, subject, everything())

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
naep <- naep %>% 
	arrange(year, grade, subject, -score_m128) %>%
	group_by(year, grade, subject) %>%
	mutate(rank=row_number())

# rank over time SMALL MULTIPLESSS
temp <- naep %>% filter(grade==8 & subject=="math")
ggplot() + geom_step(data=temp, aes(x=year, y=-rank, group=FIPS)) + facet_wrap( ~ FIPS)

# Export data
write.csv(naep, "data/main.csv", row.names=F, na="")