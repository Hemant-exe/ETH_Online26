import type { Conversation } from "@/app/types/chat"

export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    user: {
      id: "user1",
      name: "Emma",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      verified: true,
    },
    unreadCount: 2,
    messages: [
      {
        id: "msg1",
        content:
          "Hi there! I noticed we both have an interest in blockchain technology. What projects are you currently following?",
        sender: "other",
        timestamp: "2023-10-15T14:30:00Z",
        isAI: false,
      },
      {
        id: "msg2",
        content:
          "Hey Emma! Yes, I'm really into DeFi and NFT projects right now. I've been following Ethereum's progress toward proof of stake.",
        sender: "user",
        timestamp: "2023-10-15T14:35:00Z",
        isAI: false,
      },
      {
        id: "msg3",
        content:
          "That's awesome! I've been working on a small NFT project myself. The merge to PoS was such a big milestone for sustainability.",
        sender: "other",
        timestamp: "2023-10-15T14:40:00Z",
        isAI: false,
      },
      {
        id: "msg4",
        content: "Would love to hear more about your NFT project! Is it art-based or does it have utility?",
        sender: "user",
        timestamp: "2023-10-15T14:45:00Z",
        isAI: true,
      },
      {
        id: "msg5",
        content:
          "It's a blend of both actually! I'm creating digital art pieces that also serve as access passes to exclusive community events.",
        sender: "other",
        timestamp: "2023-10-15T14:50:00Z",
        isAI: false,
      },
      {
        id: "msg6",
        content: "That sounds really innovative! I'd love to see some of your work sometime.",
        sender: "user",
        timestamp: "2023-10-15T14:55:00Z",
        isAI: false,
      },
    ],
  },
  {
    id: "conv2",
    user: {
      id: "user2",
      name: "Alex",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: false,
      verified: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: "msg1",
        content: "Hey, I saw that you're into hiking too! Have you tried any trails around the city lately?",
        sender: "other",
        timestamp: "2023-10-14T10:15:00Z",
        isAI: false,
      },
      {
        id: "msg2",
        content: "Hi Alex! Yes, I went to Eagle Peak last weekend. The views were amazing! Have you been there?",
        sender: "user",
        timestamp: "2023-10-14T10:20:00Z",
        isAI: false,
      },
      {
        id: "msg3",
        content:
          "Not yet, but it's on my list! I've mostly been exploring the coastal trails. Would you recommend Eagle Peak for a day hike?",
        sender: "other",
        timestamp: "2023-10-14T10:25:00Z",
        isAI: false,
      },
    ],
  },
  {
    id: "conv3",
    user: {
      id: "user3",
      name: "Sophia",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      verified: false,
    },
    unreadCount: 1,
    messages: [
      {
        id: "msg1",
        content: "I noticed we both love photography! What kind of subjects do you usually shoot?",
        sender: "other",
        timestamp: "2023-10-13T18:05:00Z",
        isAI: false,
      },
      {
        id: "msg2",
        content:
          "Hi Sophia! I'm mostly into street photography and landscapes. I love capturing candid moments in urban settings. How about you?",
        sender: "user",
        timestamp: "2023-10-13T18:10:00Z",
        isAI: true,
      },
      {
        id: "msg3",
        content:
          "That's cool! I focus more on portrait photography and sometimes macro. There's something magical about capturing the details in someone's expression or in tiny objects.",
        sender: "other",
        timestamp: "2023-10-13T18:15:00Z",
        isAI: false,
      },
    ],
  },
  {
    id: "conv4",
    user: {
      id: "user4",
      name: "James",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: false,
      verified: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: "msg1",
        content:
          "Hello! I see you're interested in cryptography. Are you working in the field or is it more of a hobby?",
        sender: "other",
        timestamp: "2023-10-12T09:30:00Z",
        isAI: false,
      },
      {
        id: "msg2",
        content:
          "Hey James! It started as a hobby but has become part of my work now. I'm fascinated by zero-knowledge proofs and their applications in privacy. What about you?",
        sender: "user",
        timestamp: "2023-10-12T09:35:00Z",
        isAI: false,
      },
    ],
  },
  {
    id: "conv5",
    user: {
      id: "user5",
      name: "Olivia",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      verified: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: "msg1",
        content: "Hi there! I noticed we both have an interest in classical music. Do you play any instruments?",
        sender: "other",
        timestamp: "2023-10-11T15:20:00Z",
        isAI: false,
      },
      {
        id: "msg2",
        content: "Hello Olivia! Yes, I play the piano, though not as much as I'd like to these days. How about you?",
        sender: "user",
        timestamp: "2023-10-11T15:25:00Z",
        isAI: false,
      },
      {
        id: "msg3",
        content:
          "I play the violin! I've been part of a small chamber group for a few years now. Piano is wonderful - maybe we could play together sometime?",
        sender: "other",
        timestamp: "2023-10-11T15:30:00Z",
        isAI: false,
      },
      {
        id: "msg4",
        content:
          "That would be amazing! I'd love to try some duets. What kind of pieces do you usually play with your chamber group?",
        sender: "user",
        timestamp: "2023-10-11T15:35:00Z",
        isAI: true,
      },
    ],
  },
]

