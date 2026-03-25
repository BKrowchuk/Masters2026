export interface PastResult {
  year: number;
  champion: string;
  coChampion?: string;
  runnerUp?: string;
  coRunnerUp?: string;
  secondPlace?: string;
  thirdPlace?: string;
  comments?: string;
  description?: string;
}

export const pastResults: PastResult[] = [
  {
    year: 2025,
    champion: "?",
    secondPlace: "",
    thirdPlace: "",
    comments: "",
    description: ""
  },
  {
    year: 2024,
    champion: "Luther",
    secondPlace: "John Paul George & Ringo",
    thirdPlace: "Za German",
    comments: "3 way tie, tie breakers go to Luther",
    description: "Luther is hunting for Goose, 3 wins in 4 years. He's early 2000s Tiger"
  },
  {
    year: 2023,
    champion: "Rocky",
    secondPlace: "Jacko",
    thirdPlace: "Mr 62",
    description: "Rocky finds his way back to the top after 16 years"
  },
  {
    year: 2022,
    champion: "Luther",
    coChampion: "Murph",
    comments: "First Place tie",
    description: "Luther is getting used to the top spot, Murph challenges ending in a tie"
  },
  {
    year: 2021,
    champion: "Luther",
    runnerUp: "Krow",
    description: "Luther finally is on the top of the podium as COVID still interupts us from gathering on Masters' Sunday"
  },
  {
    year: 2020,
    champion: "The Goose",
    description: "Though no one showed up, The Goose still made his presence felt as he wins his record 5th title"
  },
  {
    year: 2019,
    champion: "Palumbi",
    runnerUp: "Za German*",
    coRunnerUp: "Krow*",
    comments: "Tie for second place",
    description: "Congratulations mr palumbi with a -47 , 2nd tied at -46 with The german and the actor. You can thank me later for the comment to NOT sidebet. 3 guys at -45. What a great finish and welcome back tiger!"
  },
  {
    year: 2018,
    champion: "Za German",
    description: "Za German makes it back to back years"
  },
  {
    year: 2017,
    champion: "Za German",
    description: "Za German picks up his first win in his maiden start"
  },
  {
    year: 2016,
    champion: "The Goose",
    runnerUp: "The Phantom",
    description: "The Goose goes back to back claiming his 4th victory"
  },
  {
    year: 2015,
    champion: "Jacko*",
    coChampion: "The Goose*",
    comments: "First Place tie",
    description: "Jacko likes to share the top spot. This time with The Goose who is on top for his record 3rd victory"
  },
  {
    year: 2014,
    champion: "Jacko*",
    coChampion: "Palumbi*",
    comments: "First Place tie",
    description: "The first year it ends in a tie with Jacko and Mark Palumbi sharing the top spot"
  },
  {
    year: 2013,
    champion: "G.D. Leo Greco",
    runnerUp: "Luther*",
    coRunnerUp: "Rocky*",
    comments: "Tie for second place",
    description: "All we have to say is G.D. Leo Greco"
  },
  {
    year: 2012,
    champion: "Dool Time",
    runnerUp: "The Goose",
    description: "What time is it ?? It's Dool Time!!!"
  },
  {
    year: 2011,
    champion: "The Goose",
    runnerUp: "L-dough",
    description: "The Goose is the first time repeat champion"
  },
  {
    year: 2010,
    champion: "Hammy",
    runnerUp: "Dool Time",
    description: "Hammy is the winner!!!"
  },
  {
    year: 2009,
    champion: "Mr 62",
    runnerUp: "Rocky",
    description: "Mr 62 goes low in his victory"
  },
  {
    year: 2008,
    champion: "The Goose",
    runnerUp: "Mr 62*",
    coRunnerUp: "Hammy*",
    comments: "Tie for second place",
    description: "The Goose gets on the board with his first win"
  },
  {
    year: 2007,
    champion: "Rocky",
    runnerUp: "The Goose",
    description: "Rocky wins the inaugrual Masters Pool with a record setting score"
  }
]; 