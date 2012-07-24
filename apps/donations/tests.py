from decimal import Decimal

from django.test import TestCase
from django.core.exceptions import ValidationError

from apps.bluebottle_utils.tests import UserTestsMixin
from apps.projects.tests import ProjectTestsMixin

from .models import Donation, DonationLine


class DonationTestsMixin(ProjectTestsMixin, UserTestsMixin):
    """ Base class for tests using donations. """
    def create_donation(self, user=None, amount=None):
        if not user:
            user = self.create_user()

        if not amount:
            amount = Decimal('10.00')

        return Donation(user=user, amount=amount)

    def create_donationline(self, donation=None, project=None, amount=None):
        if not project:
            project = self.create_project()
            project.save()

        if not donation:
            donation = self.create_donation()
            donation.save()

        if not amount:
            amount = Decimal('10.00')

        return DonationLine(donation=donation, project=project, amount=amount)

class DonationTests(TestCase, DonationTestsMixin):
    """ Tests for donations. """

    def test_donationsave(self):
        """ Test if saving a donation works. """

        donation = self.create_donation()
        donation.save()

    def test_donationlinesave(self):
        """ Test if saving a donation line works. """

        donationline = self.create_donationline()
        donationline.save()

    def test_unicode(self):
        """ Test to see wheter unicode representations will fail or not. """
        donation = self.create_donation()

        donation_str = unicode(donation)
        self.assertTrue(donation_str)
        self.assertIn('10.00 on', donation_str)

        donationline = self.create_donationline()

        donation_str = unicode(donationline)
        self.assertTrue(donation_str)
        self.assertIn('10.00 from donation', donation_str)

    def test_donationvalidation(self):
        """ Test validation for DonationLine objects. """

        donation = self.create_donation(amount=Decimal('20.00'))
        donation.save()

        # 21 should raise an error because it's more than 20
        donationline = self.create_donationline(amount=Decimal('21.00'))
        self.assertRaises(ValidationError, donationline.full_clean)

        # 19 should be fine
        donationline = self.create_donationline(
            amount=Decimal('19.00'), donation=donation
        )
        donationline.full_clean()

        # 20 should be fine
        donationline = self.create_donationline(
            amount=Decimal('20.00'), donation=donation
        )
        donationline.full_clean()

        # Now check wheter it is actually updated
        # Add a donation of 5 and see whether 16 raises an error and
        # 15 does not
        donationline = self.create_donationline(
            amount=Decimal('5.00'), donation=donation
        )
        donationline.save()

        # 16 should now raise an error
        donationline = self.create_donationline(
            amount=Decimal('16.00'), donation=donation
        )
        self.assertRaises(ValidationError, donationline.full_clean)

        # 15 should be fine
        donationline = self.create_donationline(
            amount=Decimal('15.00'), donation=donation
        )
        donationline.full_clean()

    def test_donationupdate(self):
        """ Regression test for updating donationlines. """

        donation = self.create_donation(amount=Decimal('20.00'))
        donation.save()

        # 21 should raise an error because it's more than 20
        donationline = self.create_donationline(
            amount=Decimal('21.00'), donation=donation
        )
        self.assertRaises(ValidationError, donationline.full_clean)

        # Updating to 19 should be fine
        donationline.amount = Decimal('19.00')
        donationline.full_clean()

    def test_supporters(self):
        """
        Test whether project supporters are properly returned.

        TODO: This *might* belong in the projects app *but* this would
        yield a cyclical import. Solution: turn tests into module with
        base classes in `base.py` instead of having everything in one file.
        """

        donationline = self.create_donationline()
        donationline.save()

        # Test wether a single supporter is properly listed
        supporters = list(donationline.project.get_supporters())

        self.assertEqual(supporters, [donationline.donation.user])

        # Add another
        other_user = self.create_user()

        donation = self.create_donation(user=other_user)
        donation.save()

        donationline = self.create_donationline(
            donation=donation, project=donationline.project
        )
        donationline.save()

        supporters = donationline.project.get_supporters()
        self.assertIn(other_user, supporters)
        self.assertEquals(supporters.count(), 2)
