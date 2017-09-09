import * as permissions from './permissions'
import { Project, User, Publication } from 'domain/types/model'

const genericUser: User = {
  userId: 'test-user-uuid',
  publicationAnalytics: {},
  beenionAnalytics: {
    UserUpvotedWithGold: 0,
    UserUpvotedWithSilver: 0,
    UserUpvotedWithBronze: 0,
    UserDownvotedWithGold: 0,
    UserDownvotedWithSilver: 0,
    UserDownvotedWithBronze: 0
  }
}

const genericPublication: Publication = {
  publicationId: 'test-publication-uuid',
  privileges: {
    canUpdatePublication: { beenionRank: 100 },
    canDeletePublication: { beenionRank: 100 },
    canCreateProject: { beenionRank: 100 },
    canDeleteProject: { beenionRank: 100 },
    canBanProject: { beenionRank: 100 },
    canUpdateProject: { beenionRank: 100 },
    canResubmitProject: { beenionRank: 100 },
    canVoteWithGold: { beenionRank: 100 },
    canVoteWithSilver: { beenionRank: 100 },
    canVoteWithBronze: { beenionRank: 100 }
  },
  rankConditions: {
    events: {
      ReviewInvitationAccepted: { factor: 1, group: 'invitation' },
      ReviewInvitationDeclined: { factor: -1, group: 'invitation' },
      ReviewInvitationExpired: { factor: -1, group: 'invitation' },
      ProjectUpvotedWithGold: { factor: 1, group: 'projectGold' },
      ProjectUpvotedWithSilver: { factor: 1, group: 'projectSilver' },
      ProjectUpvotedWithBronze: { factor: 1, group: 'projectBronze' },
      ProjectDownvotedWithGold: { factor: -1, group: 'projectGold' },
      ProjectDownvotedWithSilver: { factor: -1, group: 'projectSilver' },
      ProjectDownvotedWithBronze: { factor: -1, group: 'projectBronze' },
      ReviewUpvotedWithGold: { factor: 1, group: 'reviewGold' },
      ReviewUpvotedWithSilver: { factor: 1, group: 'reviewSilver' },
      ReviewUpvotedWithBronze: { factor: 1, group: 'reviewBronze' },
      ReviewDownvotedWithGold: { factor: -1, group: 'reviewGold' },
      ReviewDownvotedWithSilver: { factor: -1, group: 'reviewSilver' },
      ReviewDownvotedWithBronze: { factor: -1, group: 'reviewBronze' }
    },
    groups: {
      invitation: { min: -100, max: 100 },
      projectGold: { min: -100, max: 100 },
      projectSilver: { min: -100, max: 100 },
      projectBronze: { min: -100, max: 100 },
      reviewGold: { min: -100, max: 100 },
      reviewSilver: { min: -100, max: 100 },
      reviewBronze: { min: -100, max: 100 }
    }
  },
  projectStageRules: [
    {
      canReview: {
        beenionRank: 0,
        publicationRank: 10
      },
      maxReviewers: 3,
      threshold: 2
    },
    {
      canReview: {
        beenionRank: 0,
        publicationRank: 10
      },
      maxReviewers: 3,
      threshold: 3
    }
  ]
}

const genericProject: Project = {
  projectId: 'test-project-uuid',
  ownerId: 'test-projectowner-uuid',
  stageRules: genericPublication.projectStageRules,
  currentStage: 0,
  reviewers: ['test-user1-uuid', 'test-user2-uuid', 'test-user3-uuid'],
  evaluations: [
    {
      reviewerId: 'test-user1-uuid',
      evaluation: 'accept'
    },
    {
      reviewerId: 'test-user2-uuid',
      evaluation: 'accept'
    },
    {
      reviewerId: 'test-user3-uuid',
      evaluation: 'reject'
    }
  ],
  reviewProcessCompleted: false,
  banned: false
}

describe('project invariants', () => {

  it('should not delete project - not owner nor sufficient rank', () => {
    const user = {
      ...genericUser
    }
    const publication = {
      ...genericPublication,
      privileges: {
        ...genericPublication.privileges,
        canDeleteProject: { beenionRank: 10 }
      }
    }
    const project = {
      ...genericProject
    }
    expect(permissions.canDeleteProject(user, project, publication)).toBe(false)
  })

  it('should delete project - sufficient rank', () => {
    const user = {
      ...genericUser,
      beenionAnalytics: {
        ...genericUser.beenionAnalytics,
        UserUpvotedWithGold: 100
      }
    }
    const publication = {
      ...genericPublication,
      privileges: {
        ...genericPublication.privileges,
        canDeleteProject: { beenionRank: 10 }
      }
    }
    const project = {
      ...genericProject
    }
    expect(permissions.canDeleteProject(user, project, publication)).toBe(true)
  })

  it('should delete project - project owner', () => {
    const user = {
      ...genericUser,
      userId: 'test-user'
    }
    const publication = {
      ...genericPublication,
      privileges: {
        ...genericPublication.privileges,
        canDeleteProject: { beenionRank: 10 }
      }
    }
    const project = {
      ...genericProject,
      ownerId: 'test-user'
    }
    expect(permissions.canDeleteProject(user, project, publication)).toBe(true)
  })
})
