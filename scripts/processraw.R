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

naep <- rbind(math4, read4, math8, read8)
naep <- naep %>% select(year, FIPS, grade, subject, everything())

# Plot adjusted vs unadjusted
plot(naep$score_m1, naep$score_m128)
abline(a=0, b=1, col="red")
plot(adj2013$score_m1, adj2013$score_m128)
abline(a=0, b=1, col="red")

# 2013 long subset
adj2013 <- naep[,c(1:27, 29, 283)]
adj2013 <- adj2013 %>% filter(year==2013)
long2013 <- adj2013 %>% mutate(temp = score_m128) %>% 
	gather(type, score, score_m1:score_m128) %>%
	mutate(type = ifelse(type=="score_m1", "unadjusted", "adjusted"))
read4_13 <- long2013 %>% filter(grade==4 & subject=="reading")

read4_13$FIPS <- factor(read4_13$FIPS , levels = read4_13$FIPS[order(read4_13$temp)])
dotplot <- ggplot(read4_13, aes(x=score, y=FIPS, color=type, group=FIPS)) + geom_line(color="black") + geom_point(size=2)
dotplot
png(filename = "charts/reading4_2013.png", width=800, height=1000, res=100)
dotplot
dev.off()